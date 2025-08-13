const cds = require("@sap/cds");

module.exports = (srv) => {
  const {
    SupplierInvoiceHeader,
    SupplierInvoiceItem,
    AccountingDocumentHeader,
    AccountingDocumentItem,
    PurchasingDocumentHeader,
    PurchasingDocumentItem,
    MaterialDocument,
    MaterialMaster,
    MaterialDescriptions,
    VendorMaster,
  } = srv.entities;

  const validateDataFormat = (data, context = "", req) => {
    // Validate grossAmount
    if (
      data.grossAmount !== undefined &&
      (isNaN(data.grossAmount) || data.grossAmount <= 0)
    ) {
      req.error(
        400,
        `Gross Amount must be a positive decimal (e.g., 5.000), got ${data.grossAmount} (${context})`
      );
      return false;
    }

    // Validate each item's amount
    if (Array.isArray(data.supplierInvoiceItem)) {
      for (const item of data.supplierInvoiceItem) {
        if (item.amount === undefined || item.amount <= 0) {
          req.error(
            400,
            `Item amount must be a positive decimal (e.g., 5.000), got ${item.amount} (${context})`
          );
          return false;
        }
      }
    }

    // Validate documentDate
    if (data.documentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const docDate = new Date(data.documentDate);
      if (docDate > today) {
        req.error(400, "Document date must be current or in the past");
        return false;
      }
    }

    return true;
  };

  const validatePurchaseOrder = async (data, tx, req) => {
    const { purchaseOrder_purchaseOrder, purchaseOrderItem_purchaseOrderItem } =
      data;

    // Early return if required PO data is not provided
    if (!purchaseOrder_purchaseOrder && !purchaseOrderItem_purchaseOrderItem) {
      return true;
    }

    try {
      const validationPromises = [];

      // Validate Purchase Order Header if provided
      if (purchaseOrder_purchaseOrder) {
        validationPromises.push(
          tx.run(
            SELECT.one
              .from(PurchasingDocumentHeader)
              .where({ purchaseOrder: purchaseOrder_purchaseOrder })
          )
        );
      }

      // Validate Purchase Order Item if provided
      if (purchaseOrderItem_purchaseOrderItem) {
        validationPromises.push(
          tx.run(
            SELECT.one
              .from(PurchasingDocumentItem)
              .where({ purchaseOrderItem: purchaseOrderItem_purchaseOrderItem })
          )
        );
      }

      const [poExists, poItemExists] = await Promise.all(validationPromises);

      // Check validation results
      if (purchaseOrder_purchaseOrder && !poExists) {
        req.error(
          400,
          `Purchase Order '${purchaseOrder_purchaseOrder}' not found`,
          "PURCHASE_ORDER_NOT_FOUND"
        );
        return false;
      }

      if (purchaseOrderItem_purchaseOrderItem && !poItemExists) {
        req.error(
          400,
          `Purchase Order Item '${purchaseOrderItem_purchaseOrderItem}' not found`,
          "PURCHASE_ORDER_ITEM_NOT_FOUND"
        );
        return false;
      }

      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating purchase order: ${error.message}`,
        "PURCHASE_ORDER_VALIDATION_ERROR"
      );
      return false;
    }
  };

  const validateMaterialItems = async (data, tx, req) => {
    const items = data?.supplierInvoiceItem;

    // Early return if no items to validate
    if (!Array.isArray(items) || items.length === 0) {
      return true;
    }

    try {
      // Collect all unique material codes that need validation
      const materialCodes = items
        .map((item) => item?.material_material)
        .filter(Boolean)
        .filter((code, index, arr) => arr.indexOf(code) === index); // Remove duplicates

      if (materialCodes.length === 0) {
        return true; // No materials to validate
      }

      // Batch validate all materials at once
      const materialValidations = await Promise.all(
        materialCodes.map((materialCode) =>
          tx
            .run(
              SELECT.one.from(MaterialMaster).where({ material: materialCode })
            )
            .then((result) => ({ materialCode, exists: !!result }))
        )
      );

      // Check for any missing materials
      const missingMaterials = materialValidations
        .filter((validation) => !validation.exists)
        .map((validation) => validation.materialCode);

      if (missingMaterials.length > 0) {
        const errorMessage =
          missingMaterials.length === 1
            ? `Material '${missingMaterials[0]}' not found in Material Master`
            : `Materials not found in Material Master: ${missingMaterials
                .map((m) => `'${m}'`)
                .join(", ")}`;

        req.error(400, errorMessage, "MATERIAL_NOT_FOUND");
        return false;
      }

      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating materials: ${error.message}`,
        "MATERIAL_VALIDATION_ERROR"
      );
      return false;
    }
  };

  const validatePurchasingLimit = async (data, tx, req, context = "") => {
    const items = Array.isArray(data?.supplierInvoiceItem)
      ? data.supplierInvoiceItem
      : [];

    // Early return if no items to validate
    if (items.length === 0) {
      return true;
    }

    let totalInvoiceAmount = 0;

    for (const item of items) {
      const {
        purchaseOrder_purchaseOrder,
        purchaseOrderItem_purchaseOrderItem,
        quantity,
        amount,
      } = item;

      // Fetch EKPO (PurchasingDocumentItem) record
      const ekpo = await tx.run(
        SELECT.one.from(PurchasingDocumentItem).where({
          purchaseOrderItem: purchaseOrderItem_purchaseOrderItem,
          purchaseOrder: purchaseOrder_purchaseOrder,
        })
      );

      if (!ekpo) {
        req.error(
          400,
          `Purchase Order Item ${purchaseOrderItem_purchaseOrderItem} not found in EKPO (${context})`
        );
        return false;
      }

      const expectedAmount = ekpo.netPrice * quantity;

      if (amount > expectedAmount) {
        req.error(
          400,
          `Item amount (${amount}) exceeds allowed value (${expectedAmount}) for PO ${purchaseOrder_purchaseOrder} (${context})`
        );
        return false;
      }

      totalInvoiceAmount += amount;
    }

    // Check against supplier credit limit
    const supplier = await tx.run(
      SELECT.one.from(VendorMaster).where({ supplier: data.supplier_supplier })
    );

    if (!supplier) {
      req.error(
        400,
        `Supplier ${data.supplier_supplier} not found (${context})`
      );
      return false;
    }

    if (totalInvoiceAmount > supplier.creditLimit) {
      req.error(
        400,
        `Total invoice amount (${totalInvoiceAmount}) exceeds supplier credit limit (${supplier.creditLimit}) (${context})`
      );
      return false;
    }

    return true;
  };

  async function autoGenInvoiceItem(tx) {
    const last = await tx.run(
      SELECT.one
        .from(SupplierInvoiceHeader)
        .orderBy({ supplierInvoice: "desc" })
    );

    // Start from 5500000000, increment by 1
    const lastNumber = last?.supplierInvoice
      ? parseInt(last.supplierInvoice, 10)
      : 5500000000;
    const nextNo = String(lastNumber + 1).padStart(10, "0");

    return nextNo;
  }

  srv.before("CREATE", SupplierInvoiceHeader.drafts, async (req) => {
    const tx = cds.transaction(req);
    const operation = "CREATE";
    const data = req.data;

    try {
      if (!data.supplierInvoice) {
        data.supplierInvoice = await autoGenInvoiceItem(tx);
      }
      if (!data.fiscalYear) {
        const currentYear = new Date().getFullYear().toString();
        data.fiscalYear = currentYear;
      }

      if (!data.currency || typeof data.currency !== "object") {
        data.currency = { code: "AUD" };
      }

      // Step 3: Run all validations in parallel
      const validationTasks = [
        validatePurchaseOrder(data, tx, req),
        validateMaterialItems(data, tx, req),
      ];

      const validationResults = await Promise.allSettled(validationTasks);

      const hasValidationErrors = validationResults.some(
        (result) => result.status === "rejected" || result.value === false
      );
      if (hasValidationErrors) return;

      // Step 4: Validate data format
      const isFormatValid = validateDataFormat(data, operation, req);
      if (!isFormatValid) return;

      // Step 5: Validate purchasing limits
      const isLimitValid = await validatePurchasingLimit(
        data,
        tx,
        req,
        operation
      );
      if (!isLimitValid) return;

      // All validations passed — proceed with creation logic
      // You can now insert accounting entries or other business logic here
    } catch (error) {
      req.error(500, `Unexpected error during CREATE: ${error.message}`);
    }
  });
};
