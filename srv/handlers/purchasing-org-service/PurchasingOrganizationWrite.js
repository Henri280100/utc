const onCreatePurchasingOrgData = async (req) => {
  const { purchasingOrganization, purchasingInfoRecord, netPrice, priceUnit } = req.data;

  if (!purchasingOrganization?.trim())
    return req.error(400, "Purchasing organization is required.", "purchasingOrganization");
  if (!purchasingInfoRecord?.trim())
    return req.error(400, "Purchasing info record is required.", "purchasingInfoRecord");
  if (netPrice === null || netPrice === undefined || netPrice === "")
    return req.error(400, "Net price is required.", "netPrice");
  if (netPrice <= 0)
    return req.error(400, "Net price must be greater than 0.", "netPrice");
  if (priceUnit === null || priceUnit === undefined || priceUnit === "")
    return req.error(400, "Price unit is required.", "priceUnit");
  if (priceUnit <= 0)
    return req.error(400, "Price unit must be greater than 0.", "priceUnit");

  req.data.purchasingOrganization = purchasingOrganization.trim().toUpperCase();
  req.data.purchasingInfoRecord = purchasingInfoRecord.trim().toUpperCase();
};

const onUpdatePurchasingOrgData = async (req) => {
  if (req.data.purchasingOrganization)
    return req.error(
      400,
      "Purchasing organization cannot be changed after creation.",
      "purchasingOrganization",
    );
  if (req.data.purchasingInfoRecord)
    return req.error(
      400,
      "Purchasing info record cannot be changed after creation.",
      "purchasingInfoRecord",
    );

  if (req.data.netPrice !== undefined && req.data.netPrice <= 0)
    return req.error(400, "Net price must be greater than 0.", "netPrice");
  if (req.data.priceUnit !== undefined && req.data.priceUnit <= 0)
    return req.error(400, "Price unit must be greater than 0.", "priceUnit");
};

const onDeletePurchasingOrgData = async (req) => {
  // Simple deletion allowed - no referential integrity checks needed
};

export {
  onCreatePurchasingOrgData,
  onUpdatePurchasingOrgData,
  onDeletePurchasingOrgData,
};
