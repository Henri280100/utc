const onCreateVendorMaster = async (req) => {
  const { supplier, supplierName, country } = req.data;

  if (!supplier?.trim())
    return req.error(400, "Supplier code is required.", "supplier");
  if (!supplierName?.trim())
    return req.error(400, "Supplier name is required.", "supplierName");
  if (!country?.trim())
    return req.error(400, "Country is required.", "country");

  req.data.supplier = supplier.trim().toUpperCase();
  req.data.supplierName = supplierName.trim();
  req.data.creationDate =
    req.data.creationDate ?? new Date().toISOString().split("T")[0];
};

const onUpdateVendorMaster = async (req) => {
  if (req.data.supplier)
    return req.error(
      400,
      "Supplier code cannot be changed after creation.",
      "supplier",
    );
};

const onDeleteVendorMaster = async (req) => {
  const { supplier } = req.params[0];

  const hasInfoRecords = await SELECT.one
    .from("transaction.table.PurchasingInfoRecord")
    .where({ supplier_supplier: supplier });

  if (hasInfoRecords)
    return req.error(
      409,
      `Supplier ${supplier} cannot be deleted — linked purchasing info records exist.`,
      "supplier",
    );
};

export {
  onCreateVendorMaster,
  onUpdateVendorMaster,
  onDeleteVendorMaster,
};
