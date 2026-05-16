const onCreateMaterialMaster = async (req) => {
  const { material, materialType, industrySector, baseUnit } = req.data;

  if (!material?.trim())
    return req.error(400, "Material number is required.", "material");
  if (!materialType?.trim())
    return req.error(400, "Material type is required.", "materialType");
  if (!industrySector?.trim())
    return req.error(400, "Industry sector is required.", "industrySector");
  if (!baseUnit?.trim())
    return req.error(400, "Base unit is required.", "baseUnit");

  req.data.material = material.trim().toUpperCase();
  req.data.creationDate =
    req.data.creationDate ?? new Date().toISOString().split("T")[0];
};

const onUpdateMaterialMaster = async (req) => {
  if (req.data.material)
    return req.error(
      400,
      "Material number cannot be changed after creation.",
      "material",
    );
  if (req.data.baseUnit === "")
    return req.error(400, "Base unit cannot be empty.", "baseUnit");
};

const onDeleteMaterialMaster = async (req) => {
  const { material } = req.params[0];

  const hasInfoRecords = await SELECT.one
    .from("transaction.table.PurchasingInfoRecord")
    .where({ material_material: material });

  if (hasInfoRecords)
    return req.error(
      409,
      `Material ${material} cannot be deleted — linked purchasing info records exist.`,
      "material",
    );

  const hasDocs = await SELECT.one
    .from("transaction.table.MaterialDocument")
    .where({ material_material: material });

  if (hasDocs)
    return req.error(
      409,
      `Material ${material} cannot be deleted — linked material documents exist.`,
      "material",
    );
};

export { onCreateMaterialMaster, onUpdateMaterialMaster, onDeleteMaterialMaster };
