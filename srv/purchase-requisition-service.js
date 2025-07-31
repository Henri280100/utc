const cds = require("@sap/cds");

module.exports = async (srv) => {
  const {
    PurchaseRequisition,
    MaterialMaster, // MARA equivalent
    Plant, // T001W equivalent
    StorageLocations, // T001L equivalent
    PurchasingGroups, // T024 equivalent
    PurchasingDocumentTypes, // T161 equivalent
    PurchasingInfoRecord, // EINE equivalent - restored for pricing
    PurchaseRequisitionAccountAssignment
  } = srv.entities;

  // Configurable budget limit (in AUD)
  const BUDGET_LIMIT = 500000;

  // Allowed release statuses - ADD "REL" to match your payload
  const ALLOWED_RELEASE_STATUSES = [
    "Pending",
    "Approved",
    "Rejected",
    "Released",
    "REL", // Added to match your payload
    "Cancelled",
  ];

  // Helper function to validate mandatory fields - Updated per requirements
  function validateMandatoryFields(data, context = "") {
    // Required fields per specification: Material, Plant, Quantity, DeliveryDate, PurchasingGroup
    const mandatoryFields = [
      "material_material", // Material (MARA)
      "plant_plant", // Plant (T001W)
      "quantity", // Quantity
      "deliveryDate", // DeliveryDate
      "PurchasingGroup_purchasingGroup", // PurchasingGroup (T024)
    ];

    const missing = mandatoryFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );
    if (missing.length > 0) {
      return `Missing mandatory fields in ${context}: ${missing.join(", ")}`;
    }
    return null;
  }

  // Helper function to validate foreign keys - Per SAP table requirements
  async function validateForeignKeys(tx, data, context = "") {
    // Validate Material exists in MARA (MaterialMaster)
    if (data.material_material) {
      const material = await tx.run(
        SELECT.one
          .from(MaterialMaster)
          .where({ material: data.material_material })
      );
      if (!material) {
        return `Material ${data.material_material} does not exist in MARA (MaterialMaster) (${context})`;
      }
    }

    // Validate Plant exists in T001W (Plant)
    if (data.plant_plant) {
      const plant = await tx.run(
        SELECT.one.from(Plant).where({ plant: data.plant_plant })
      );
      if (!plant) {
        return `Plant ${data.plant_plant} does not exist in T001W (Plant) (${context})`;
      }
    }

    // Validate StorageLocation exists in T001L for the Plant
    if (data.storageLocation_storageLocation || data.storageLocation) {
      const storageLocationCode =
        data.storageLocation_storageLocation || data.storageLocation;
      let plantCode = data.plant_plant;

      if (!plantCode && context === "UPDATE") {
        const pr = await tx.run(
          SELECT.one.from(PurchaseRequisition).where({
            purchaseRequisition: data.purchaseRequisition,
            purchaseReqnItem: data.purchaseReqnItem,
          })
        );
        if (!pr) {
          return `Purchase Requisition ${data.purchaseRequisition}/${data.purchaseReqnItem} not found for Storage Location validation (${context})`;
        }
        plantCode = pr.plant_plant;
      }

      if (!plantCode) {
        return `Cannot validate Storage Location: Plant not found (${context})`;
      }

      const storageLocation = await tx.run(
        SELECT.one.from(StorageLocations).where({
          plant: plantCode,
          storageLocation: storageLocationCode,
        })
      );

      if (!storageLocation) {
        return `Storage Location ${storageLocationCode} does not exist in T001L for Plant ${plantCode} (${context})`;
      }
    }

    // Validate PurchasingGroup exists in T024 (PurchasingGroups)
    if (data.PurchasingGroup_purchasingGroup) {
      const purchasingGroup = await tx.run(
        SELECT.one
          .from(PurchasingGroups)
          .where({ purchasingGroup: data.PurchasingGroup_purchasingGroup })
      );
      if (!purchasingGroup) {
        return `Purchasing Group ${data.PurchasingGroup_purchasingGroup} does not exist in T024 (PurchasingGroups) (${context})`;
      }
    }

    // Validate PurchaseRequisitionType exists in T161 (PurchasingDocumentTypes)
    if (data.purchaseRequisitionType) {
      const prType = await tx.run(
        SELECT.one.from(PurchasingDocumentTypes).where({
          documentCategory: "B",
          documentType: data.purchaseRequisitionType,
        })
      );
      if (!prType) {
        return `Purchase Requisition Type ${data.purchaseRequisitionType} does not exist in T161 (PurchasingDocumentTypes) for document category 'B' (${context})`;
      }
    }

    // Validate releaseStatus
    if (
      data.releaseStatus &&
      !ALLOWED_RELEASE_STATUSES.includes(data.releaseStatus)
    ) {
      return `Invalid releaseStatus '${
        data.releaseStatus
      }'. Allowed values: ${ALLOWED_RELEASE_STATUSES.join(", ")} (${context})`;
    }

    return null;
  }

  // Helper function to validate data format - Per requirements
  function validateDataFormat(data, context = "") {
    // Validate Quantity: Positive decimal (e.g., 5.000)
    if (
      data.quantity !== undefined &&
      (isNaN(data.quantity) || data.quantity <= 0)
    ) {
      return `Quantity must be a positive decimal (e.g., 5.000), got ${data.quantity} (${context})`;
    }

    // Validate DeliveryDate: Future date (≥ current date)
    if (data.deliveryDate) {
      try {
        const currentDate = new Date().toISOString().split("T")[0];
        const deliveryDateObj = new Date(data.deliveryDate);
        
        if (isNaN(deliveryDateObj.getTime())) {
          return `Invalid delivery date format: '${data.deliveryDate}'. Expected format: YYYY-MM-DD (${context})`;
        }
        
        const deliveryDate = deliveryDateObj.toISOString().split("T")[0];
        
        if (deliveryDate < currentDate) {
          return `Delivery Date (${deliveryDate}) must be today or a future date (≥ ${currentDate}) (${context})`;
        }
      } catch (error) {
        return `Error validating delivery date: ${error.message} (${context})`;
      }
    }

    return null;
  }

  // Helper function to check purchasing limits - Per requirements
  async function validatePurchasingLimit(tx, data, existingPR, context = "") {
    console.log("validatePurchasingLimit - Input:", { data, existingPR });
    const quantity = data.quantity ?? existingPR?.quantity;
    const material = data.material_material ?? existingPR?.material_material;
    

    if (!quantity || quantity <= 0) {
      return `Invalid quantity: ${quantity} (${context})`;
    }
    if (!material) {
      return `Missing material information (${context})`;
    }

    try {
      const result = await tx.run(
        SELECT.from(PurchasingInfoRecord)
          .where({ material_material: material })
          .columns("purchasingInfoRecord", {
            ref: ["purchasingOrgData"],
            expand: ["*"],
          })
      );

      const infoRecord = result[0];

      if (!infoRecord || !infoRecord.purchasingInfoRecord) {
        return `Missing PurchasingInfoRecord for material '${material}' (${context})`;
      }

      console.log(
        "InfoRecord with OrgData:",
        JSON.stringify(infoRecord, null, 2)
      );

      // Check if we have org data
      if (
        !infoRecord.purchasingOrgData ||
        infoRecord.purchasingOrgData.length === 0
      ) {
        return `No purchasing organization data found for InfoRecord '${infoRecord.purchasingInfoRecord}' (${context})`;
      }

      // Use the first org data entry
      const orgData = infoRecord.purchasingOrgData[0];

      if (orgData.netPrice == null || orgData.priceUnit == null) {
        return `No pricing found for InfoRecord '${infoRecord.purchasingInfoRecord}' and Org '${orgData.purchasingOrganization}' (${context})`;
      }

      const netPrice = parseFloat(infoRecord.purchasingOrgData.netPrice);
      const priceUnit = parseFloat(infoRecord.purchasingOrgData.priceUnit || 1);
      const effectivePrice = netPrice / priceUnit;
      const totalValue = effectivePrice * quantity;

      if (totalValue > BUDGET_LIMIT) {
        return `Total value (${totalValue.toFixed(
          2
        )} AUD) exceeds budget (${BUDGET_LIMIT.toLocaleString()} AUD) (${context})`;
      }

      console.log(`Validation passed - Total: ${totalValue.toFixed(2)} AUD`);
    } catch (error) {
      return `Error validating purchasing limit: ${error.message} (${context})`;
    }

    return null;
  }

  // UPDATE validation for PurchaseRequisition
  srv.before("UPDATE", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.data;
    const data = {
      ...req.data,
      storageLocation_storageLocation:
        req.data.storageLocation || req.data.storageLocation_storageLocation,
    };
    delete data.accountAssignment; // Ignore incorrect accountAssignment field

    // Log the incoming payload for debugging
    console.log("UPDATE Payload:", JSON.stringify(req.data));
    console.log("Processed Data:", JSON.stringify(data));

    // Fetch existing PR to check unchanged fields
    const existingPR = await tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .where({ purchaseRequisition, purchaseReqnItem })
    );
    if (!existingPR) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }

    // Step 1: Validate data format FIRST (catches negative quantity)
    const formatError = validateDataFormat(data, "UPDATE");
    if (formatError) {
      req.error(400, formatError);
      return;
    }

    // Step 2: Validate mandatory fields
    const mandatoryFields = [
      "material_material",
      "plant_plant",
      "quantity",
      "deliveryDate",
      "PurchasingGroup_purchasingGroup",
    ];
    const mandatoryError = validateMandatoryFields(
      { ...existingPR, ...data },
      mandatoryFields,
      "UPDATE"
    );
    if (mandatoryError) {
      req.error(400, mandatoryError);
      return;
    }

    // Step 3: Validate foreign keys
    const fkError = await validateForeignKeys(tx, data, "UPDATE");
    if (fkError) {
      req.error(400, fkError);
      return;
    }

    // Step 4: Validate purchasing limit
    const limitError = await validatePurchasingLimit(
      tx,
      data,
      existingPR,
      "UPDATE"
    );
    if (limitError) {
      req.error(400, limitError);
      return;
    }
  });

  // createPurchaseRequisitionItem action
  srv.on("createPurchaseRequisitionItem", async (req) => {
    const tx = cds.transaction(req);
    const {
      purchaseRequisition,
      material,
      plant,
      quantity,
      deliveryDate,
      purchasingGroup,
      storageLocation,
    } = req.data;
    const data = {
      purchaseRequisition,
      material_material: material,
      plant_plant: plant,
      quantity,
      deliveryDate,
      PurchasingGroup_purchasingGroup: purchasingGroup,
      storageLocation_storageLocation: storageLocation,
      releaseStatus: "Pending", // Enforce Pending for new items
    };

    // Log the incoming payload for debugging
    console.log(
      "createPurchaseRequisitionItem Payload:",
      JSON.stringify(req.data)
    );

    // Step 1: Validate mandatory fields
    const mandatoryError = validateMandatoryFields(
      data,
      [
        "material_material",
        "plant_plant",
        "quantity",
        "deliveryDate",
        "PurchasingGroup_purchasingGroup",
      ],
      "createPurchaseRequisitionItem"
    );
    if (mandatoryError) {
      req.error(400, mandatoryError);
      return;
    }

    // Step 2: Validate foreign keys
    const fkError = await validateForeignKeys(
      tx,
      data,
      "createPurchaseRequisitionItem"
    );
    if (fkError) {
      req.error(400, fkError);
      return;
    }

    // Step 3: Validate data format
    const formatError = validateDataFormat(
      data,
      "createPurchaseRequisitionItem"
    );
    if (formatError) {
      req.error(400, formatError);
      return;
    }

    // Step 4: Validate purchasing limit
    const limitError = await validatePurchasingLimit(
      tx,
      data,
      data,
      "createPurchaseRequisitionItem"
    );
    if (limitError) {
      req.error(400, limitError);
      return;
    }

    // Step 5: Create new PurchaseRequisition item
    const newItem = {
      purchaseRequisition,
      purchaseReqnItem: "00010", // Adjust logic for item number generation
      material_material: material,
      plant_plant: plant,
      storageLocation_storageLocation: storageLocation || null,
      PurchasingGroup_purchasingGroup: purchasingGroup,
      purchaseRequisitionType: "NB",
      quantity,
      deliveryDate,
      baseUnit: "EA",
      requisitioner: "USER1",
      releaseStatus: "Pending",
      requisitionDate: new Date().toISOString().split("T")[0],
      createdByUser: "USER1",
    };

    await tx.run(INSERT.into(PurchaseRequisition).entries(newItem));

    // Step 6: Create default Account Assignment
    const accountAssignment = {
      purchaseRequisition,
      purchaseReqnItem: "00010",
      acctAssignment: "01",
      acctAssignmentCategory: "K",
      glAccount: "400000",
      costCenter: "CC001",
      order: "ORD001",
    };
    await tx.run(
      INSERT.into(PurchaseRequisitionAccountAssignment).entries(
        accountAssignment
      )
    );

    return tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .where({ purchaseRequisition, purchaseReqnItem: "00010" })
    );
  });

  // Bound actions with visibility checks
  srv.before("approve", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus === "Approved" || pr.releaseStatus === "Rejected") {
      req.error(
        400,
        `Action Approve is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("approve", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    await UPDATE(PurchaseRequisition)
      .set({ releaseStatus: "Approved" })
      .where({ purchaseRequisition, purchaseReqnItem });
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  srv.before("reject", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus === "Approved" || pr.releaseStatus === "Rejected") {
      req.error(
        400,
        `Action Reject is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("reject", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const { reason } = req.data;
    await UPDATE(PurchaseRequisition)
      .set({ releaseStatus: "Rejected" })
      .where({ purchaseRequisition, purchaseReqnItem });
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  srv.before("edit", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus !== "Pending") {
      req.error(
        400,
        `Action Edit is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("edit", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  srv.before("cancel", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus !== "Pending" && pr.releaseStatus !== "Approved") {
      req.error(
        400,
        `Action Cancel is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("cancel", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    await UPDATE(PurchaseRequisition)
      .set({ releaseStatus: "Cancelled" })
      .where({ purchaseRequisition, purchaseReqnItem });
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  // Ensure Account Assignments are returned with PurchaseRequisition
  srv.after("READ", PurchaseRequisition, async (data, req) => {
    if (Array.isArray(data)) {
      for (const item of data) {
        const accountAssignments = await SELECT.from(
          PurchaseRequisitionAccountAssignment
        ).where({
          purchaseRequisition: item.purchaseRequisition,
          purchaseReqnItem: item.purchaseReqnItem,
        });
        item.accountAssignments = accountAssignments;
      }
    } else if (data) {
      const accountAssignments = await SELECT.from(
        PurchaseRequisitionAccountAssignment
      ).where({
        purchaseRequisition: data.purchaseRequisition,
        purchaseReqnItem: data.purchaseReqnItem,
      });
      data.accountAssignments = accountAssignments;
    }
  });
};
