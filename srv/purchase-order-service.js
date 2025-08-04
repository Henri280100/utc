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

  console.log("PurchaseDocumentHeader", srv.entities.PurchaseDocumentHeader);

  // Configuration for budget limit
  const BUDGET_LIMIT = 1000000; // AUD 1,000,000

  // Helper: Validate mandatory fields
  const validateMandatoryFields = (data, fields, context) => {
    const missing = fields.filter((field) => !data[field] && data[field] !== 0);
    return missing.length > 0
      ? `Missing mandatory fields in ${context}: ${missing.join(", ")}`
      : null;
  };

  // Helper: Validate data formats
  const validateDataFormat = (data, context) => {
    const documentItemData = data.purchasingDocumentItem[0];

    if (
      documentItemData.quantity !== undefined &&
      (isNaN(documentItemData.quantity) || documentItemData.quantity <= 0)
    ) {
      return `Quantity must be a positive decimal in ${context}`;
    }
    if (
      documentItemData.netPrice !== undefined &&
      (isNaN(documentItemData.netPrice) || documentItemData.netPrice <= 0)
    ) {
      return `NetPrice must be a positive decimal in ${context}`;
    }
    if (data.documentDate) {
      const docDate = new Date(data.documentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(docDate) || docDate > today) {
        return `Document date must be current or past in ${context}`;
      }
    }
    return null;
  };

  // Helper: Validate foreign keys
  const validateForeignKeys = async (tx, data, context) => {
    console.log(
      `validateForeignKeys - Context: ${context}, Data:`,
      JSON.stringify(data, null, 2)
    );

    // Validate supplier
    if (data.supplier) {
      console.log(`Querying VendorMaster for supplier: ${data.supplier}`);
      const supplier = await tx.run(
        SELECT.one.from(VendorMaster).where({ supplier: data.supplier })
      );
      console.log(`VendorMaster result:`, supplier);
      if (!supplier)
        return `Supplier ${data.supplier} not found in LFA1 (${context})`;
    }

    // Validate purchasing group
    if (data.purchasingGroup) {
      console.log(
        `Querying PurchasingGroups for purchasingGroup: ${data.purchasingGroup}`
      );
      const group = await tx.run(
        SELECT.one
          .from(PurchasingGroups)
          .where({ purchasingGroup: data.purchasingGroup })
      );
      console.log(`PurchasingGroups result:`, group);
      if (!group)
        return `Purchasing Group ${data.purchasingGroup} not found in T024 (${context})`;
    }

    // Validate purchase order type
    if (data.purchaseOrderType) {
      console.log(
        `Querying PurchasingDocumentTypes for documentCategory: F, documentType: ${data.purchaseOrderType}`
      );
      const poType = await tx.run(
        SELECT.one.from(PurchasingDocumentTypes).where({
          documentCategory: "F",
          documentType: data.purchaseOrderType,
        })
      );
      console.log(`PurchasingDocumentTypes result:`, poType);
      if (!poType)
        return `Purchase Order Type ${data.purchaseOrderType} not found in T161 (${context})`;
    }

    // Validate item-level fields if purchasingDocumentItem exists
    const pdItem =
      Array.isArray(data.purchasingDocumentItem) &&
      data.purchasingDocumentItem.length > 0
        ? data.purchasingDocumentItem[0]
        : null;
    if (pdItem) {
      if (pdItem.material) {
        console.log(`Querying MaterialMaster for material: ${pdItem.material}`);
        const material = await tx.run(
          SELECT.one.from(MaterialMaster).where({ material: pdItem.material })
        );
        console.log(`MaterialMaster result:`, material);
        if (!material)
          return `Material ${pdItem.material} not found in MARA (${context})`;
      }

      if (pdItem.plant) {
        console.log(`Querying Plant for plant: ${pdItem.plant}`);
        const plant = await tx.run(
          SELECT.one.from(Plant).where({ plant: pdItem.plant })
        );
        console.log(`Plant result:`, plant);
        if (!plant)
          return `Plant ${pdItem.plant} not found in T001W (${context})`;
      }

      if (pdItem.storageLocation && pdItem.plant) {
        console.log(
          `Querying StorageLocation for storageLocation: ${pdItem.storageLocation}, plant: ${pdItem.plant}`
        );
        const storage = await tx.run(
          SELECT.one.from(StorageLocations).where({
            storageLocation: pdItem.storageLocation,
            plant: pdItem.plant,
          })
        );
        console.log(`StorageLocation result:`, storage);
        if (!storage)
          return `Storage Location ${pdItem.storageLocation} not found for Plant ${pdItem.plant} in T001L (${context})`;
      }

      if (pdItem.purchaseRequisition) {
        const purchaseReqnItem = pdItem.purchaseReqnItem || "00010";
        console.log(
          `Querying PurchaseRequisition for purchaseRequisition: ${pdItem.purchaseRequisition}, purchaseReqnItem: ${purchaseReqnItem}`
        );
        const pr = await tx.run(
          SELECT.one.from(PurchaseRequisition).where({
            purchaseRequisition: pdItem.purchaseRequisition,
            purchaseReqnItem: purchaseReqnItem,
          })
        );
        console.log(`PurchaseRequisition result:`, pr);
        if (!pr || !["Released", "REL"].includes(pr.releaseStatus)) {
          return `Purchase Requisition ${pdItem.purchaseRequisition}/${purchaseReqnItem} not found in EBAN with releaseStatus 'REL' or 'Released' (${context})`;
        }

        if (!pdItem.material || !data.supplier) {
          return `Missing material or supplier for PurchasingInfoRecord query (${context})`;
        }

        const infoRecord = await tx.run(
          SELECT.from(PurchasingInfoRecord)
            .where({
              material_material: pdItem.material,
            })
            .columns("purchasingInfoRecord", {
              ref: ["purchasingOrgData"],
              expand: ["*"],
            })
        );
        console.log(`PurchasingInfoRecord result:`, infoRecord);
        if (
          !infoRecord ||
          !infoRecord[0]?.purchasingOrgData ||
          infoRecord[0]?.purchasingOrgData.length === 0
        ) {
          return `No PurchasingInfoRecord or purchasingOrgData found for material ${pdItem.material} and supplier ${data.supplier} (${context})`;
        }

        return { purchasingOrgData: infoRecord[0].purchasingOrgData };
      }
    }

    return null;
  };

  // Helper: Map OData fields to schema fields
  const mapODataToSchema = (data) => {
    console.log("mapODataToSchema - Input:", JSON.stringify(data, null, 2));
    const mapped = {
      ...data,
      supplier: data.supplier?.supplier || data.supplier_supplier,
      purchasingGroup:
        data.purchasingGroup?.purchasingGroup ||
        data.purchasingGroup_purchasingGroup,
      currency: data.currency || data.currency_code,
      purchasingDocumentItem: (data.purchasingDocumentItem || []).map(
        (item) => ({
          ...item,
          material: item.material?.material || item.material_material,
          plant: item.plant?.plant || item.plant_plant,
          purchaseRequisition:
            item.purchaseRequisition?.purchaseRequisition ||
            item.purchaseRequisition_purchaseRequisition,
          purchaseReqnItem:
            item.purchaseReqnItem || item.purchaseOrderItem || "00010",
          quantity: parseFloat(item.quantity),
          netPrice: parseFloat(item.netPrice),
        })
      ),
    };
    console.log("mapODataToSchema - Output:", JSON.stringify(mapped, null, 2));
    return mapped;
  };

  // Helper: Prepare payload for persistence
  const preparePayload = (reqData, mappedData) => {
    const payload = { ...reqData };
    payload.supplier = mappedData.supplier
      ? { supplier: mappedData.supplier }
      : undefined;
    payload.purchasingGroup = mappedData.purchasingGroup
      ? { purchasingGroup: mappedData.purchasingGroup }
      : undefined;
    payload.currency = mappedData.currency;
    delete payload.supplier_supplier;
    delete payload.purchasingGroup_purchasingGroup;
    delete payload.currency_code;
    payload.purchasingDocumentItem =
      payload.purchasingDocumentItem?.map((item) => ({
        ...item,
        material:
          item.material || item.material_material
            ? { material: item.material || item.material_material }
            : undefined,
        plant:
          item.plant || item.plant_plant
            ? { plant: item.plant || item.plant_plant }
            : undefined,
        purchaseRequisition:
          item.purchaseRequisition ||
          item.purchaseRequisition_purchaseRequisition
            ? {
                purchaseRequisition:
                  item.purchaseRequisition ||
                  item.purchaseRequisition_purchaseRequisition,
              }
            : undefined,
      })) || [];
    return payload;
  };

  // Validate budget
  const validateBudget = async (data, tx, req) => {
    console.log("validateBudget - Input:", JSON.stringify(data, null, 2));
    let totalPOValue = 0;

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
          `No items provided for Purchase Order ${data.purchaseOrder} (PurchaseDocumentHeader)`
        );
        return false;
      }
    }

    // Validate supplier
    const supplierId = items.supplier_supplier;
    if (!supplierId) {
      req.error(400, `Supplier ID is missing (PurchaseDocumentHeader)`);
      return false;
    }
    const supplier = await tx.run(
      SELECT.one.from(VendorMaster).where({ supplier: supplierId })
    );
    if (!supplier) {
      req.error(
        400,
        `Supplier ${supplierId} not found in LFA1 (PurchaseDocumentHeader)`
      );
      return false;
    }

    // Validate purchasing group
    const purchasingGroupId = data.purchasingGroup;
    if (!purchasingGroupId) {
      req.error(400, `Purchasing Group ID is missing (PurchaseDocumentHeader)`);
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
        `Purchasing Group ${purchasingGroupId} not found in T024 (PurchaseDocumentHeader)`
      );
      return false;
    }

    // Fetch purchasing organization from first item's PurchaseRequisition
    const firstItem = items[0];
    if (!firstItem?.purchaseRequisition) {
      req.error(
        400,
        `No Purchase Requisition provided in items for Purchase Order ${data.purchaseOrder} (PurchaseDocumentHeader)`
      );
      return false;
    }
    const prResult = await validateForeignKeys(
      tx,
      {
        purchaseRequisition: firstItem.purchaseRequisition,
        purchaseReqnItem: firstItem.purchaseReqnItem || "00010",
      },
      "PurchaseDocumentHeader Budget Validation"
    );
    if (prResult && !prResult.purchasingOrganization) {
      req.error(400, prResult);
      return false;
    }
    const purchasingOrg = prResult.purchasingOrganization;
    if (!purchasingOrg) {
      req.error(
        400,
        `No purchasing organization found for Purchase Requisition ${firstItem.purchaseRequisition} (PurchaseDocumentHeader)`
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
    for (const item of items) {
      const { material, quantity, plant, netPrice } = item;
      if (!material || !quantity || !plant || !netPrice) {
        req.error(
          400,
          `Invalid item data: material=${material}, quantity=${quantity}, plant=${plant}, netPrice=${netPrice} (PurchaseDocumentHeader)`
        );
        return false;
      }

      // Validate material
      const materialRecord = await tx.run(
        SELECT.one.from(MaterialMaster).where({ material })
      );
      if (!materialRecord) {
        req.error(
          400,
          `Material ${material} not found in MARA (PurchaseDocumentHeader)`
        );
        return false;
      }

      // Query PurchasingInfoRecord
      const infoRecord = await tx.run(
        SELECT.one.from(PurchasingInfoRecord).where({
          material_material: material,
          supplier_supplier: supplier.supplier,
        })
      );
      if (!infoRecord) {
        req.error(
          400,
          `No PurchasingInfoRecord found for material ${material} and supplier ${supplier.supplier} (PurchaseDocumentHeader)`
        );
        return false;
      }

      // Query PurchasingOrganizationData
      const orgData = await tx.run(
        SELECT.one.from(PurchasingOrganizationData).where({
          purchasingInfoRecord: infoRecord.purchasingInfoRecord,
          purchasingOrganization: purchasingOrg,
        })
      );
      if (!orgData || orgData.netPrice == null || orgData.priceUnit == null) {
        req.error(
          400,
          `No org-level pricing found for InfoRecord '${infoRecord.purchasingInfoRecord}', Org '${purchasingOrg}' (PurchaseDocumentHeader)`
        );
        return false;
      }

      // Validate netPrice against PurchasingOrganizationData
      if (parseFloat(netPrice) !== parseFloat(orgData.netPrice)) {
        req.error(
          400,
          `Net price ${netPrice} for item ${item.purchaseOrderItem} does not match PurchasingOrganizationData (${orgData.netPrice})`
        );
        return false;
      }

      const effectivePrice =
        parseFloat(orgData.netPrice) / parseFloat(orgData.priceUnit || 1);
      totalPOValue += effectivePrice * quantity;
      console.log("validateBudget - Item:", {
        material,
        quantity,
        effectivePrice,
        netPrice,
        itemTotal: effectivePrice * quantity,
      });
    }

    console.log("validateBudget - Total PO Value:", totalPOValue);
    if (totalPOValue > BUDGET_LIMIT) {
      req.error(
        400,
        `Total PO value (${totalPOValue.toFixed(
          2
        )} AUD) exceeds budget (${BUDGET_LIMIT.toLocaleString()} AUD) (PurchaseDocumentHeader)`
      );
      return false;
    }

    return true;
  };

  // Validate PurchaseDocumentHeader (CREATE/UPDATE)
  const validateHeader = async (req, isUpdate = false) => {
    const tx = cds.transaction(req);
    const data = mapODataToSchema(req.data);
    console.log(
      `${isUpdate ? "UPDATE" : "CREATE"} PurchaseDocumentHeader Payload:`,
      JSON.stringify(data, null, 2)
    );

    // For UPDATE, verify PO exists
    if (isUpdate) {
      const existingPO = await tx.run(
        SELECT.one
          .from(PurchaseDocumentHeader)
          .where({ purchaseOrder: data.purchaseOrder })
      );
      if (!existingPO) {
        req.error(404, `Purchase Order ${data.purchaseOrder} not found`);
        return false;
      }
      data.purchaseOrderType =
        data.purchaseOrderType || existingPO.purchaseOrderType;
      data.supplier = data.supplier || existingPO.supplier?.supplier;
      data.documentDate = data.documentDate || existingPO.documentDate;
      data.currency = data.currency || existingPO.currency;
    }

    // Validate mandatory fields
    const mandatoryError = validateMandatoryFields(
      data,
      ["purchaseOrderType", "supplier", "documentDate", "currency"],
      `PurchaseDocumentHeader ${isUpdate ? "UPDATE" : "CREATE"}`
    );
    if (mandatoryError) {
      req.error(400, mandatoryError);
      return false;
    }

    // Validate foreign keys
    const fkError = await validateForeignKeys(
      tx,
      data,
      `PurchaseDocumentHeader ${isUpdate ? "UPDATE" : "CREATE"}`
    );
    if (fkError) {
      req.error(400, fkError);
      return false;
    }

    // Validate data format
    const formatError = validateDataFormat(
      data,
      `PurchaseDocumentHeader ${isUpdate ? "UPDATE" : "CREATE"}`
    );
    if (formatError) {
      req.error(400, formatError);
      return false;
    }

    // Validate items
    for (const item of data.purchasingDocumentItem) {
      const itemContext = `PurchaseDocumentItem ${item.purchaseOrderItem} ${
        isUpdate ? "UPDATE" : "CREATE"
      }`;
      const itemFkError = await validateForeignKeys(tx, item, itemContext);
      if (itemFkError) {
        req.error(400, itemFkError);
        return false;
      }
      const itemFormatError = validateDataFormat(item, itemContext);
      if (itemFormatError) {
        req.error(400, itemFormatError);
        return false;
      }
    }

    // Validate budget
    const budgetValid = await validateBudget(data, tx, req);
    if (!budgetValid) return false;

    // Prepare payload for persistence
    if (isUpdate) {
      req.data = preparePayload(req.data, data);
    }

    return true;
  };

  // Validate PurchaseDocumentItem
  const validateItem = async (req) => {
    const tx = cds.transaction(req);
    const data = mapODataToSchema(req.data);
    const context = `PurchaseDocumentItem ${data.purchaseOrderItem}`;

    // Fetch header for supplier information
    const header = await tx.run(
      SELECT.one
        .from(PurchaseDocumentHeader)
        .where({ purchaseOrder: data.purchaseOrder })
    );
    if (!header) {
      req.error(
        400,
        `Purchase Order ${data.purchaseOrder} not found for item ${data.purchaseOrderItem}`
      );
      return false;
    }

    // Validate foreign keys
    const fkError = await validateForeignKeys(tx, data, context);
    if (fkError) {
      req.error(400, fkError);
      return false;
    }

    // Validate data format
    const formatError = validateDataFormat(data, context);
    if (formatError) {
      req.error(400, formatError);
      return false;
    }

    // Fetch purchasing organization from PurchaseRequisition
    if (!data.purchaseRequisition) {
      req.error(
        400,
        `No Purchase Requisition provided for item ${data.purchaseOrderItem} (${context})`
      );
      return false;
    }
    const prResult = await validateForeignKeys(
      tx,
      {
        purchaseRequisition: data.purchaseRequisition,
        purchaseReqnItem: data.purchaseReqnItem || "00010",
      },
      context
    );
    if (prResult && !prResult.purchasingOrganization) {
      req.error(400, prResult);
      return false;
    }
    const purchasingOrg = prResult.purchasingOrganization;
    if (!purchasingOrg) {
      req.error(
        400,
        `No purchasing organization found for Purchase Requisition ${data.purchaseRequisition} (${context})`
      );
      return false;
    }

    // Validate netPrice against PurchasingOrganizationData
    const infoRecord = await tx.run(
      SELECT.one.from(PurchasingInfoRecord).where({
        material_material: data.material,
        supplier_supplier: header.supplier?.supplier,
      })
    );
    if (!infoRecord) {
      req.error(
        400,
        `No PurchasingInfoRecord found for material ${data.material} and supplier ${header.supplier?.supplier} (${context})`
      );
      return false;
    }

    const orgData = await tx.run(
      SELECT.one.from(PurchasingOrganizationData).where({
        purchasingInfoRecord: infoRecord.purchasingInfoRecord,
        purchasingOrganization: purchasingOrg,
      })
    );
    if (!orgData || orgData.netPrice == null || orgData.priceUnit == null) {
      req.error(
        400,
        `No org-level pricing found for InfoRecord '${infoRecord.purchasingInfoRecord}', Org '${purchasingOrg}' (${context})`
      );
      return false;
    }

    if (parseFloat(data.netPrice) !== parseFloat(orgData.netPrice)) {
      req.error(
        400,
        `Net price ${data.netPrice} for item ${data.purchaseOrderItem} does not match PurchasingOrganizationData (${orgData.netPrice})`
      );
      return false;
    }

    return true;
  };

  // UPDATE handler for PurchaseDocumentHeader
  srv.before("UPDATE", PurchaseDocumentHeader, async (req) => {
    try {
      return await validateHeader(req, true);
    } catch (error) {
      req.error(
        500,
        `Error validating PurchaseDocumentHeader: ${error.message}`
      );
      return false;
    }
  });

  // CREATE handler for PurchaseDocumentHeader
  srv.before("CREATE", PurchaseDocumentHeader, async (req) => {
    try {
      return await validateHeader(req, false);
    } catch (error) {
      req.error(
        500,
        `Error validating PurchaseDocumentHeader: ${error.message}`
      );
      return false;
    }
  });

  // UPDATE handler for PurchaseDocumentItem
  srv.before("UPDATE", PurchaseDocumentItem, async (req) => {
    try {
      return await validateItem(req);
    } catch (error) {
      req.error(500, `Error validating PurchaseDocumentItem: ${error.message}`);
      return false;
    }
  });
};
