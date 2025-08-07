const cds = require("@sap/cds");

module.exports = (srv) => {
  const {
    PurchasingInfoRecord,
    PurchasingOrganizationData,
    MaterialInfoRecord,
    MaterialMaster,
    MaterialDescriptions,
    VendorMaster,
    Plant,
  } = srv.entities;

  const validateMandatoryFields = async (data, req) => {
    const mandatoryFields = ["material_material", "supplier_supplier"];

    const missingField = mandatoryFields.find((field) => !data[field]);

    if (missingField) {
      req.error(400, `Mandatory field ${missingField} is missing`);
      return false;
    }

    // Validate purchasingOrgData array
    if (!Array.isArray(data.purchasingOrgData)) {
      req.error(400, "purchasingOrgData must be an array");
      return false;
    }

    for (let i = 0; i < data.purchasingOrgData.length; i++) {
      const item = data.purchasingOrgData[i];
      if (!item.netPrice) {
        req.error(
          400,
          `netPrice is missing in purchasingOrgData at index ${i}`
        );
        return false;
      }
      if (!item.purchasingOrganization) {
        req.error(
          400,
          `purchasingOrganization is missing in purchasingOrgData at index ${i}`
        );
        return false;
      }
    }

    return true;
  };

  const validateMaterialMaster = async (data, tx, req) => {
    // Early return if material is not provided
    if (!data?.material_material) return true;

    try {
      const materialExists = await tx.run(
        SELECT.one
          .from(MaterialMaster)
          .where({ material: data.material_material })
      );

      if (!materialExists) {
        req.error(
          400, // Changed from 500 to 400 (Bad Request)
          `Material '${data.material_material}' not found in Material Master`,
          "MATERIAL_NOT_FOUND"
        );
        return false;
      }

      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating material: ${error.message}`,
        "MATERIAL_VALIDATION_ERROR"
      );
      return false;
    }
  };

  const validateVendorMaster = async (data, tx, req) => {
    // Early return if supplier is not provided
    if (!data?.supplier_supplier) return true;

    try {
      const supplierExists = await tx.run(
        SELECT.one
          .from(VendorMaster)
          .where({ supplier: data.supplier_supplier })
      );

      if (!supplierExists) {
        req.error(
          400, // Changed from 500 to 400 (Bad Request)
          `Supplier '${data.supplier_supplier}' not found in Vendor Master`,
          "SUPPLIER_NOT_FOUND"
        );
        return false;
      }

      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating supplier: ${error.message}`,
        "SUPPLIER_VALIDATION_ERROR"
      );
      return false;
    }
  };

  const validatePlant = async (data, tx, req) => {
    const { material_material } = data;
  
    // Step 1: Get all MaterialInfoRecords for the given material
    const infoRecords = await tx.run(
      SELECT.from(MaterialInfoRecord)
        .where({ material: material_material })
        .columns('application', 'plant_plant')
    );
  
    if (!infoRecords.length) {
      req.error(400, `No MaterialInfoRecord found for material ${material_material}.`);
      return;
    }
  
    // Step 2: Extract plant IDs and applications
    const plantIds = [...new Set(infoRecords.map(record => record.plant_plant))];
    const applications = [...new Set(infoRecords.map(record => record.application))];
  
    // Step 3: Validate plants exist in Plant entity
    const existingPlants = await tx.run(
      SELECT.from(Plant).where({ plant: { in: plantIds } }).columns('plant')
    );
  
    const existingPlantIds = existingPlants.map(p => p.plant);
    const missingPlants = plantIds.filter(p => !existingPlantIds.includes(p));
  
    if (missingPlants.length > 0) {
      req.error(
        400,
        `Invalid plant(s) in MaterialInfoRecord for material ${material}: ${missingPlants.join(', ')}`
      );
    }
  
    // Optional: Log or use the applications if needed
    console.log(`Applications found for material ${material}: ${applications.join(', ')}`);
  };
  

  srv.before("UPDATE", PurchasingInfoRecord, async (req) => {
    const { data } = req;
    const tx = cds.transaction(req);

    try {
      // Run mandatory validation first
      if (!(await validateMandatoryFields(data, req))) {
        return;
      }

      // Run master data validations using Promise.allSettled for better error handling
      const validationPromises = [
        {
          name: "Material Master",
          promise: validateMaterialMaster(data, tx, req),
        },
        { name: "Vendor Master", promise: validateVendorMaster(data, tx, req) },
        { name: "Plant", promise: validatePlant(data, tx, req) },
      ];

      const results = await Promise.allSettled(
        validationPromises.map((v) => v.promise)
      );

      // Check results and log any failures
      let hasFailure = false;
      results.forEach((result, index) => {
        const validationName = validationPromises[index].name;

        if (result.status === "rejected") {
          console.error(
            `${validationName} validation rejected:`,
            result.reason
          );
          hasFailure = true;
        } else if (!result.value) {
          console.log(`${validationName} validation failed`);
          hasFailure = true;
        }
      });

      if (hasFailure) {
        return; // Stop processing if any validation failed
      }
    } catch (error) {
      req.error(
        500,
        `Error validating Purchasing Info Record: ${error.message}`,
        "PURCHASING_INFO_VALIDATION_ERROR"
      );
    }
  });

  srv.before("CREATE", PurchasingInfoRecord, (req) => {});
};
