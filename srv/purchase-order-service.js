const cds = require("@sap/cds");

module.exports = async (srv) => {
  const {
    PurchaseDocumentHeader,
    PurchaseDocumentItem,
    VendorMaster,
    MaterialMaster,
    PurchaseRequisition,
    Plant,
    StorageLocation,
    PurchasingGroups,
    PurchasingInfoRecord,
    PurchasingOrganizationData,
  } = srv.entities;

  console.log("PurchaseDocumentHeader", srv.entities.PurchaseDocumentHeader)

  // Configuration for budget limit
  const BUDGET_LIMIT = 1000000; // AUD 1,000,000

  // Helper function to validate document date
  async function validateDocumentDate(data, req) {
    if (!data.documentDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(data.documentDate);
    if (date > today) {
      req.error(400, "Document date must be current or in the past");
      return false;
    }
    return true;
  }

  // Helper function to validate supplier
  async function validateSupplier(data, tx, req) {
    if (!data.supplier_supplier) return null;
    const supplier = await tx.run(
      SELECT.one.from(VendorMaster).where({ supplier: data.supplier_supplier })
    );
    if (!supplier) {
      req.error(
        400,
        `Supplier ${data.supplier_supplier} does not exist in VendorMaster`
      );
      return null;
    }
    return supplier;
  }

  // Helper function to validate purchase order type
  async function validatePurchaseOrderType(data, tx, req) {
    if (!data.purchaseOrderType) return true;
    const type = await tx.run(
      SELECT.one
        .from(PurchaseDocumentHeader)
        .where({ purchaseOrderType: data.purchaseOrderType })
    );
    if (!type) {
      req.error(
        400,
        `Purchase order type ${data.purchaseOrderType} does not exist in PurchaseOrderTypes`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate purchasing group
  async function validatePurchasingGroup(data, tx, req) {
    if (!data.purchasingGroup_purchasingGroup) return null;
    const group = await tx.run(
      SELECT.one
        .from(PurchasingGroups)
        .where({ purchasingGroup: data.purchasingGroup_purchasingGroup })
    );
    if (!group) {
      req.error(
        400,
        `Purchasing group ${data.purchasingGroup_purchasingGroup} does not exist in PurchasingGroups`
      );
      return null;
    }
    return group;
  }

  // Helper function to validate purchase requisition
  async function validatePurchaseRequisition(data, tx, req, fieldName) {
    if (
      !data.purchasingDocumentItem[0].purchaseRequisition_purchaseRequisition
    )
      return true;
    const pr = await tx.run(
      SELECT.one.from(PurchaseRequisition).where({
        purchaseRequisition: data.purchasingDocumentItem[0].purchaseRequisition_purchaseRequisition
      })
    );
    if (!pr || pr.releaseStatus !== "REL") {
      req.error(
        400,
        `Purchase requisition ${data.purchasingDocumentItem[0].purchaseRequisition_purchaseRequisition} does not exist or is not released (REL) for ${fieldName}`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate material
  async function validateMaterial(data, tx, req) {
    if (!data.purchasingDocumentItem[0].material_material) return true;
    const material = await tx.run(
      SELECT.one
        .from(MaterialMaster)
        .where({ material: data.purchasingDocumentItem[0].material_material })
    );
    if (!material) {
      req.error(
        400,
        `Material ${data.purchasingDocumentItem[0].material_material} does not exist in MaterialMaster`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate plant
  async function validatePlant(data, tx, req) {
    if (!data.purchasingDocumentItem[0].plant_plant) return true;
    const plant = await tx.run(
      SELECT.one.from(Plant).where({ plant: data.purchasingDocumentItem[0].plant_plant })
    );
    if (!plant) {
      req.error(400, `Plant ${data.purchasingDocumentItem[0].plant_plant} does not exist in Plant`);
      return false;
    }
    return true;
  }

  // Helper function to validate storage location
  async function validateStorageLocation(data, tx, req) {
    if (!data.purchasingDocumentItem[0].storageLocation || (!data.purchasingDocumentItem[0].plant_plant && !data.purchasingDocumentItem[0].purchaseOrder))
      return true;
    const plantId =
      data.purchasingDocumentItem[0].plant_plant ||
      (
        await tx.run(
          SELECT.one
            .from(PurchaseDocumentItem)
            .where({
              purchaseOrder: data.purchaseOrder,
              purchaseOrderItem: data.purchaseOrderItem,
            })
        )
      ).plant_plant;
    const storageLoc = await tx.run(
      SELECT.one
        .from(StorageLocation)
        .where({ plant: plantId, storageLocation: data.purchasingDocumentItem[0].storageLocation })
    );
    if (!storageLoc) {
      req.error(
        400,
        `Storage location ${data.storageLocation} does not exist for plant ${plantId}`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate quantity
  async function validateQuantity(data, req) {
    if (data.quantity === undefined) return true;
    if (data.quantity <= 0) {
      req.error(
        400,
        `Quantity for item ${data.purchaseOrderItem} must be positive`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate net price
  async function validateNetPrice(data, headerData, purchasingOrg, tx, req) {
    if (data.purchaseDocumentItem.netPrice === undefined) return true;

    const materialId =
      data.purchaseDocumentItem.material_material ||
      (
        await tx.run(
          SELECT.one
            .from(PurchaseDocumentItem)
            .where({
              purchaseOrder: data.purchaseOrder,
              purchaseOrderItem: data.purchaseOrderItem,
            })
        )
      ).material_material;
    const supplierId = headerData.supplier_supplier;

    // Find PurchasingInfoRecord for material and supplier
    const infoRecord = await tx.run(
      SELECT.one.from(PurchasingInfoRecord).where({
        material_material: materialId,
        supplier_supplier: supplierId,
      })
    );
    if (!infoRecord) {
      req.error(
        400,
        `No purchasing info record found for material ${materialId} and supplier ${supplierId}`
      );
      return false;
    }

    // Validate net price from PurchasingOrganizationData
    const pricing = await tx.run(
      SELECT.one.from(PurchasingOrganizationData).where({
        purchasingInfoRecord: infoRecord.purchasingInfoRecord,
        purchasingOrganization: purchasingOrg,
      })
    );
    if (!pricing || pricing.netPrice <= 0) {
      req.error(
        400,
        `Invalid or missing net price for material ${materialId} and supplier ${supplierId} in purchasing organization ${purchasingOrg}`
      );
      return false;
    }
    if (data.netPrice !== pricing.netPrice) {
      req.error(
        400,
        `Net price for item ${data.purchaseOrderItem} does not match purchasing organization data (${pricing.netPrice})`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate total PO value against budget
  async function validateBudget(data, tx, req) {
    const items = await tx.run(
      SELECT.from(PurchaseDocumentItem).where({
        purchaseOrder: data.purchaseOrder,
      })
    );
    let totalPOValue = 0;
    const supplier =
      (await validateSupplier(data, tx, req)) ||
      (await tx.run(
        SELECT.one
          .from(VendorMaster)
          .where({
            supplier: (
              await tx.run(
                SELECT.one
                  .from(PurchaseDocumentHeader)
                  .where({ purchaseOrder: data.purchaseOrder })
              )
            ).supplier_supplier,
          })
      ));
    const purchasingGroup =
      (await validatePurchasingGroup(data, tx, req)) ||
      (await tx.run(
        SELECT.one
          .from(PurchasingGroups)
          .where({
            purchasingGroup: (
              await tx.run(
                SELECT.one
                  .from(PurchaseDocumentHeader)
                  .where({ purchaseOrder: data.purchaseOrder })
              )
            ).purchasingGroup_purchasingGroup,
          })
      ));
    const purchasingOrg = "1000"; // Example purchasing organization ID


    for (const item of items) {
      const infoRecord = await tx.run(
        SELECT.one.from(PurchasingInfoRecord).where({
          material_material: item.material_material,
          'supplier.supplier': supplier.supplier,
        })
      );
      if (!infoRecord) {
        req.error(
          400,
          `No purchasing info record found for material ${item.material_material} and supplier ${supplier.supplier}`
        );
        return false;
      }

      const pricing = await tx.run(
        SELECT.one.from(PurchasingOrganizationData).where({
          purchasingInfoRecord: infoRecord.purchasingInfoRecord,
          purchasingOrganization: purchasingOrg,
        })
      );
      if (!pricing) {
        req.error(
          400,
          `Missing pricing data for material ${item.material_material} and supplier ${supplier_supplier.supplier} in purchasing organization ${purchasingOrg}`
        );
        return false;
      }
      totalPOValue += item.quantity * item.netPrice;
    }

    const budgetLimit = Math.min(
      supplier.budgetLimit || BUDGET_LIMIT,
      purchasingGroup.budgetLimit || BUDGET_LIMIT
    );
    if (totalPOValue > budgetLimit) {
      req.error(
        400,
        `Total PO value ${totalPOValue} exceeds budget limit of ${budgetLimit} AUD`
      );
      return false;
    }
    return true;
  }



  //Before UPDATE handler for PurchaseDocumentHeader
  srv.before("UPDATE", PurchaseDocumentHeader, async (req) => {
      const tx = cds.transaction(req);
      const data = req.data;
    console.log(JSON.stringify(data));

    try {
      // Validate DocumentDate
      if (!(await validateDocumentDate(data, req))) {
        return;
      }

      // Validate Supplier
      const supplier = await validateSupplier(data, tx, req);
      if (data.supplier_supplier && !supplier) return;

      // Validate PurchaseOrderType
      if (!(await validatePurchaseOrderType(data, tx, req))) {
        return;
      }

      // Validate PurchasingGroup
      const purchasingGroup = await validatePurchasingGroup(data, tx, req);
      if (data.purchasingGroup_purchasingGroup && !purchasingGroup) return;

      // Validate PurchaseRequisition
      if (!(await validatePurchaseRequisition(data, tx, req, "header"))) {
        return;
      }

      // Validate Total PO Value
      if (!(await validateBudget(data, tx, req))) {
        return;
      }
    } catch (error) {
      req.error(
        500,
        `Error validating purchase order header: ${error.message}`
      );
    }
  });

  // Before UPDATE handler for PurchaseDocumentItem
  srv.before("UPDATE", PurchaseDocumentItem, async (req) => {
    const data = req.data;
    const tx = cds.transaction(req);
    

    try {
      // Assume a default purchasing organization
      const purchasingOrg = "1000"; // Example purchasing organization ID

      // Fetch header for supplier information
      const header = await tx.run(
        SELECT.one
          .from(PurchaseDocumentHeader)
          .where({ purchaseOrder: data.purchaseOrder })
      );

      // Validate Material
      if (!(await validateMaterial(data, tx, req))) {
        return;
      }

      // Validate Plant
      if (!(await validatePlant(data, tx, req))) {
        return;
      }

      // Validate StorageLocation
      if (data.storageLocation || data.plant_plant) {
        if (!(await validateStorageLocation(data, tx, req))) {
          return;
        }
      }

      // Validate PurchaseRequisition
      if (
        !(await validatePurchaseRequisition(
          data,
          tx,
          req,
          `item ${data.purchaseOrderItem}`
        ))
      ) {
        return;
      }

      // Validate Quantity
      if (!(await validateQuantity(data, req))) {
        return;
      }

      // Validate NetPrice
      if (!(await validateNetPrice(data, header, purchasingOrg, tx, req))) {
        return;
      }
    } catch (error) {
      req.error(500, `Error validating purchase order item: ${error.message}`);
    }
  });
};
