const cds = require("@sap/cds");

module.exports = async (srv) => {
  const {
    PurchaseDocumentHeader,
    PurchaseDocumentItem,
    VendorMaster,
    MaterialMaster,
    PurchaseRequisition,
    Plant,
    PurchasingDocumentTypes,
    StorageLocations,
    PurchasingGroups,
    PurchasingInfoRecord,
    PurchasingOrganizationData,
  } = srv.entities;

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
        `Supplier ${data.supplier_supplier} not found in VendorMaster`
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
        `Purchase order type ${data.purchaseOrderType} not found in PurchaseOrderTypes`
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
        `Purchasing group ${data.purchasingGroup_purchasingGroup} not found in PurchasingGroups`
      );

      return null;
    }

    return group;
  }

  // Helper function to validate purchase requisition

  async function validatePurchaseRequisition(data, tx, req, fieldName) {
    if (!data.purchaseRequisition_purchaseRequisition) return true;

    const pr = await tx.run(
      SELECT.one.from(PurchaseRequisition).where({
        purchaseRequisition: data.purchaseRequisition_purchaseRequisition,
      })
    );

    if (!pr || pr.releaseStatus !== "REL") {
      req.error(
        400,
        `Purchase requisition ${data.purchaseRequisition_purchaseRequisition} does not exist or is not released (REL) for ${fieldName}`
      );

      return false;
    }

    return true;
  }

  // Helper function to validate material

  async function validateMaterial(data, tx, req) {
    if (!data.material_material) return true;

    const material = await tx.run(
      SELECT.one
        .from(MaterialMaster)
        .where({ material: data.material_material })
    );

    if (!material) {
      req.error(
        400,
        `Material ${data.material_material} not found in MaterialMaster`
      );

      return false;
    }

    return true;
  }

  // Helper function to validate plant

  async function validatePlant(data, tx, req) {
    if (!data.plant_plant) return true;

    const plant = await tx.run(
      SELECT.one.from(Plant).where({ plant: data.plant_plant })
    );

    if (!plant) {
      req.error(400, `Plant ${data.plant_plant} not found in Plant`);

      return false;
    }

    return true;
  }

  // Helper function to validate storage location

  async function validateStorageLocation(data, tx, req) {
    if (!data.storageLocation || (!data.plant_plant && !data.purchaseOrder))
      return true;

    const plantId =
      data.plant_plant ||
      (
        await tx.run(
          SELECT.one.from(PurchaseDocumentItem).where({
            purchaseOrder: data.purchaseOrder,
            purchaseOrderItem: data.purchaseOrderItem,
          })
        )
      )?.plant_plant;

    if (!plantId) {
      req.error(400, `Cannot determine plant for storage location validation`);

      return false;
    }

    const storageLoc = await tx.run(
      SELECT.one
        .from(StorageLocations)
        .where({ plant: plantId, storageLocation: data.storageLocation })
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
    if (data.netPrice === undefined) return true;

    const supplierId = headerData.supplier_supplier;

    // Find PurchasingInfoRecord for material and supplier

    const infoRecord = await tx.run(
      SELECT.one.from(PurchasingInfoRecord).where({
        supplier_supplier: supplierId,
      })
    );

    if (!infoRecord) {
      req.error(
        400,
        `No purchasing info record found for supplier ${supplierId}`
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

    if (!pricing || pricing.netPrice == null || pricing.priceUnit == null) {
      req.error(
        400,
        `Invalid or missing net price for material supplier ${supplierId} in purchasing organization ${purchasingOrg}`
      );

      return false;
    }

    const effectivePrice =
      parseFloat(pricing.netPrice) / parseFloat(pricing.priceUnit || 1);

    if (parseFloat(data.netPrice) !== effectivePrice) {
      req.error(
        400,
        `Net price ${data.netPrice} for item ${data.purchaseOrderItem} does not match purchasing organization data (${effectivePrice})`
      );

      return false;
    }

    return true;
  }

  // Helper function to validate foreign keys (simulating validateForeignKeys)

  async function validateForeignKeys(tx, data, context) {
    const { purchaseRequisition, material, supplier } = data;

    // Validate PurchaseRequisition

    const pr = await tx.run(
      SELECT.one.from(PurchaseRequisition).where({
        purchaseRequisition,
      })
    );

    if (!pr || pr.releaseStatus !== "REL") {
      return `Purchase requisition ${purchaseRequisition} does not exist or is not released (REL) for ${context}`;
    }

    // Validate Material

    const materialRecord = await tx.run(
      SELECT.one.from(MaterialMaster).where({ material })
    );

    if (!materialRecord) {
      return `Material ${material} not found in MaterialMaster for ${context}`;
    }

    // Validate PurchasingInfoRecord

    const infoRecord = await tx.run(
      SELECT.one.from(PurchasingInfoRecord).where({
        material_material: material,
      })
    );

    if (!infoRecord) {
      return `No purchasing info record found for supplier ${supplier} for ${context}`;
    }

    // Fetch PurchasingOrganizationData (assume default purchasing organization)

    const purchasingOrg = "1000"; // Example purchasing organization ID

    const orgData = await tx.run(
      SELECT.one.from(PurchasingOrganizationData).where({
        purchasingInfoRecord: infoRecord.purchasingInfoRecord,
        purchasingOrganization: purchasingOrg,
      })
    );

    if (!orgData) {
      return `No purchasing organization data found for info record ${infoRecord.purchasingInfoRecord} and organization ${purchasingOrg} for ${context}`;
    }

    return { purchasingOrganization: purchasingOrg };
  }

  // Helper function to validate budget

  async function validateBudget(data, tx, req) {
    console.log("validateBudget - Input:", JSON.stringify(data, null, 2));

    // Skip budget validation if no budget-relevant fields are updated
    if (
      !data.purchasingDocumentItem &&
      !data.supplier_supplier &&
      !data.purchasingGroup_purchasingGroup
    ) {
      console.log(
        "validateBudget - Skipping budget validation: no budget-relevant fields updated"
      );
      return true;
    }

    // Ensure purchase order exists
    const header = await tx.run(
      SELECT.one
        .from(PurchaseDocumentHeader)
        .where({ purchaseOrder: data.purchaseOrder })
    );
    if (!header) {
      req.error(404, `Purchase order ${data.purchaseOrder} does not exist`);
      return false;
    }

    // Fetch items
    let items = data.purchasingDocumentItem || [];
    if (items.length === 0) {
      items = await tx.run(
        SELECT.from(PurchaseDocumentItem).where({
          purchaseOrder: data.purchaseOrder,
        })
      );
      if (items.length === 0) {
        req.error(
          400,
          `No items found for purchase order ${data.purchaseOrder}`
        );
        return false;
      }
    }

    // Validate supplier (LFA1)
    const supplierId = data.supplier_supplier || header.supplier_supplier;
    if (!supplierId) {
      req.error(
        400,
        `Supplier ID is missing for purchase order ${data.purchaseOrder}`
      );
      return false;
    }
    console.log(`validateBudget - Using supplier: ${supplierId}`);
    const supplier = await tx.run(
      SELECT.one.from(VendorMaster).where({ supplier: supplierId })
    );
    if (!supplier) {
      req.error(400, `Supplier ${supplierId} not found in VendorMaster (LFA1)`);
      return false;
    }

    // Validate purchasing group
    const purchasingGroupId =
      data.purchasingGroup_purchasingGroup ||
      header.purchasingGroup_purchasingGroup;
    if (!purchasingGroupId) {
      req.error(
        400,
        `Purchasing group ID is missing for purchase order ${data.purchaseOrder}`
      );
      return false;
    }
    const purchasingGroup = await tx.run(
      SELECT.one
        .from(PurchasingGroups)
        .where({ purchasingGroup: purchasingGroupId })
    );
    if (!purchasingGroup) {
      req.error(
        400,
        `Purchasing group ${purchasingGroupId} not found in PurchasingGroups`
      );
      return false;
    }

    // Fetch purchasing organization from first item's PurchaseRequisition
    const firstItem = items[0];
    if (!firstItem?.purchaseRequisition_purchaseRequisition) {
      req.error(
        400,
        `No purchase requisition provided in items for purchase order ${data.purchaseOrder}`
      );
      return false;
    }

    const prResult = await validateForeignKeys(
      tx,
      {
        purchaseRequisition: firstItem.purchaseRequisition_purchaseRequisition,
        material: firstItem.material_material,
        supplier: supplierId,
      },
      `PurchaseDocumentHeader Budget Validation`
    );

    console.log(
      "validateBudget - prResult:",
      JSON.stringify(prResult, null, 2)
    );

    // Handle validateForeignKeys result
    if (typeof prResult === "string") {
      req.error(400, prResult);
      return false;
    }
    if (typeof prResult === "object" && !prResult.purchasingOrganization) {
      req.error(400, `Invalid purchase requisition validation result`);
      return false;
    }

    const purchasingOrg = prResult.purchasingOrganization;
    if (!purchasingOrg) {
      req.error(
        400,
        `No purchasing organization found for purchase requisition ${firstItem.purchaseRequisition_purchaseRequisition}`
      );
      return false;
    }

    console.log(
      "validateBudget - Supplier:",
      supplier.supplier,
      "PurchasingGroup:",
      purchasingGroup.purchasingGroup,
      "PurchasingOrg:",
      purchasingOrg
    );

    // Process each item
    let totalPOValue = 0;
    for (const item of items) {
      const { quantity, plant_plant, netPrice, purchaseOrderItem } = item;
      if (!quantity || !plant_plant || !netPrice) {
        req.error(
          400,
          `Invalid item data: quantity=${quantity}, plant=${plant_plant}, netPrice=${netPrice} for purchase order ${data.purchaseOrder}, item ${purchaseOrderItem}`
        );
        return false;
      }

      // Optional: Query PurchasingInfoRecord for reference (but don't enforce strict matching)
      console.log(
        `validateBudget - Querying PurchasingInfoRecord for supplier: ${supplier.supplier}`
      );
      const infoRecord = await tx.run(
        SELECT.one.from(PurchasingInfoRecord).where({
          supplier_supplier: supplier.supplier,
        })
      );

      let effectivePrice = parseFloat(netPrice);

      if (infoRecord) {
        // Query PurchasingOrganizationData for reference pricing
        const orgData = await tx.run(
          SELECT.one.from(PurchasingOrganizationData).where({
            purchasingInfoRecord: infoRecord.purchasingInfoRecord,
            purchasingOrganization: purchasingOrg,
          })
        );

        if (orgData && orgData.netPrice != null && orgData.priceUnit != null) {
          const masterPrice =
            parseFloat(orgData.netPrice) / parseFloat(orgData.priceUnit || 1);
          const priceDifference = Math.abs(effectivePrice - masterPrice);
          const percentageDiff = (priceDifference / masterPrice) * 100;

          // Log warning if price differs significantly (e.g., >10%) but don't fail
          if (percentageDiff > 10) {
            console.warn(
              `Price variance for item ${purchaseOrderItem}: Provided=${effectivePrice}, Master=${masterPrice}, Variance=${percentageDiff.toFixed(
                1
              )}%`
            );
          }
        }
      }

      const itemTotal = effectivePrice * quantity;
      totalPOValue += itemTotal;

      console.log("validateBudget - Item:", {
        purchaseOrderItem,
        quantity,
        effectivePrice,
        netPrice,
        itemTotal,
      });
    }

    console.log("validateBudget - Total PO Value:", totalPOValue);
    if (totalPOValue > BUDGET_LIMIT) {
      req.error(
        400,
        `Total PO value (${totalPOValue.toFixed(
          2
        )} AUD) exceeds budget limit (${BUDGET_LIMIT.toLocaleString()} AUD)`
      );
      return false;
    }

    return true;
  }

  // Before UPDATE handler for PurchaseDocumentHeader

  srv.before("UPDATE", PurchaseDocumentHeader, async (req) => {
    const data = req.data;

    const tx = cds.transaction(req);

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

  async function generatePONumber(tx) {
    const last = await tx.run(
      SELECT.one
        .from(PurchaseDocumentHeader)
        .orderBy({ purchaseOrder: "desc" })
    );
    const next = String(parseInt(last?.purchaseOrder || "0", 10) + 1).padStart(
      10,
      "0"
    );
    return next;
  }

  async function getPriceFromPIR (tx, material, supplier) {
    const pir = await tx.run(
      SELECT.one.from(PurchasingInfoRecord)
        .where({ material_material: material, supplier_supplier: supplier })
        .columns(p => p.purchasingOrgData(d => d.columns('netPrice', 'priceUnit')))
    )
    if (pir?.purchasingOrgData?.length) {
      const { netPrice, priceUnit } = pir.purchasingOrgData[0]
      return { netPrice, priceUnit }
    }
    return { netPrice: null, priceUnit: null }
  }

  // Draft phase: just gentle defaults (won’t override UI)
  srv.before("NEW", PurchaseDocumentHeader.drafts, async (req) => {
    const tx = cds.transaction(req);
    req.data.purchaseOrder = await generatePONumber(tx);
    req.data.documentCategory ??= 'F'       // Purchase Order
    req.data.purchaseOrderType ??= 'NB'     // keep your custom type if you set it
    req.data.documentDate ??= new Date()
    req.data.currency_code ??= 'USD'        // FK field, not association
    req.data.paymentTerms ??= '0001'
    // Do NOT generate purchaseOrder here (only on activation/CREATE)
  })

  // Activation: final checks, minimal enrichment, atomic deep-insert
  srv.before("CREATE", PurchaseDocumentHeader.drafts, async (req) => {
    const tx = cds.transaction(req)

    // Assign number if the caller didn't send one (covers non-draft callers)
    if (!req.data.purchaseOrder) {
      req.data.purchaseOrder = await generatePONumber(tx)
    }
    const po = req.data.purchaseOrder

    // Items: if you want to enforce "at least one item", keep this tiny check:
    // if (!Array.isArray(req.data.purchasingDocumentItem) || req.data.purchasingDocumentItem.length === 0) {
    //   return req.error(400, 'At least one purchasingDocumentItem is required')
    // }

    // Check if purchasingDocumentItem exists and is an array before processing
    if (req.data.purchasingDocumentItem && Array.isArray(req.data.purchasingDocumentItem)) {
      // Ensure item technicals; do NOT re-check mandatory fields here
      for (let i = 0; i < req.data.purchasingDocumentItem.length; i++) {
        const it = req.data.purchasingDocumentItem[i]
        it.purchaseOrder = po
        if (!it.purchaseOrderItem) {
          it.purchaseOrderItem = String((i + 1) * 10).padStart(5, '0')
        }

        // Optional enrichment (only if you want it; otherwise remove this block)
        if ((it.netPrice == null || Number.isNaN(it.netPrice)) && req.data.supplier_supplier && it.material_material) {
          const { netPrice, priceUnit } = await getPriceFromPIR(tx, it.material_material, req.data.supplier_supplier)
          if (netPrice != null) it.netPrice = netPrice
          if (priceUnit != null) it.priceUnit = priceUnit
          if (it.priceUnit == null) it.priceUnit = 1
        }
      }
    }

    // Gentle defaults that won't overwrite your payload (optional)
    req.data.documentCategory ??= 'F'
    req.data.purchaseOrderType ??= 'NB'
    req.data.documentDate ??= new Date()
    req.data.currency_code ??= 'USD'
    req.data.paymentTerms ??= '0001'
  })
};
