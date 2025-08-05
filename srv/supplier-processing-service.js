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

  const validateMandatoryFields = async (data, req) => {
    const mandatoryFields = [
      "supplier_supplier",
      "documentDate",
      "grossAmount",
      "currency_code",
    ];

    for (let field of mandatoryFields) {
      if (!data[field]) {
        req.error(400, `Mandatory field ${field} is missing`);
        return false;
      }
    }
    return true;
  };

  const validateVendorSupplier = async (data, tx, req) => {
    if (!data.supplier_supplier) {
      return true;
    }

    const vendorSupplier = await tx.run(
      SELECT.one.from(VendorMaster).where({ supplier: data.supplier_supplier })
    );
    if (!vendorSupplier) {
      req.error(
        400,
        `Supplier ${data.supplier_supplier} not found in VendorMaster (LFA1)`
      );
    }
  };

  const validatePurchaseOrder = async (data, tx, req) => {
    const { purchaseOrder_purchaseOrder, purchaseOrderItem_purchaseOrderItem } =
      data;

    const poExists = await tx.run(
      SELECT.one
        .from(PurchasingDocumentHeader)
        .where({ purchaseOrder: purchaseOrder_purchaseOrder })
    );

    const poItemExists = await tx.run(
      SELECT.one
        .from(PurchasingDocumentItem)
        .where({ purchaseOrderItem: purchaseOrderItem_purchaseOrderItem })
    );
    if (!poExists || !poItemExists) {
      req.error(400, `Invalid Purchase Order or Purchase Order Item`);
    }
  };

  const validateMaterial = async (data, tx, req) => {
    const items = data.supplierInvoiceItem;

    if (!items || items.length === 0) {
      return true; // No items to validate
    }

    for (const item of items) {
      const materialCode = item.material_material;

      if (!materialCode) {
        continue; // Skip if no material provided
      }

      const materialExists = await tx.run(
        SELECT.one.from(MaterialMaster).where({ material: materialCode })
      );

      if (!materialExists) {
        req.error(
          400,
          `Invalid material '${materialCode}' not found in Material Master`
        );
        return false;
      }
    }

    return true;
  };

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

  const validatePurchasingLimit = async (data, tx, req, context = "") => {
    const items = data.supplierInvoiceItem;
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

  srv.before("UPDATE", SupplierInvoiceHeader, async (req) => {
    const data = req.data;
    const tx = cds.transaction(req);

    try {
      const validations = [
        await validateMandatoryFields(data, req),
        await validateVendorSupplier(data, tx, req),
        await validatePurchaseOrder(data, tx, req),
        await validateMaterial(data, tx, req),
        validateDataFormat(data, "UPDATE", req),
      ];

      for (const isValid of validations) {
        if (!isValid) return;
      }
    } catch (error) {
      req.error(
        500,
        `Error validating Supplier Invoice Header: ${error.message}`
      );
    }
  });

  srv.before("CREATE", SupplierInvoiceHeader, async (req) => {
    // will do it later
  });
};
