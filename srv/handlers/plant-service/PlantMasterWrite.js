const onCreatePlantMaster = async (req) => {
  const { plant, plantName, city } = req.data;

  if (!plant?.trim()) return req.error(400, "Plant code is required.", "plant");
  if (plant.trim().length > 4)
    return req.error(400, "Plant code must be 4 characters or less.", "plant");
  if (!plantName?.trim())
    return req.error(400, "Plant name is required.", "plantName");
  if (!city?.trim()) return req.error(400, "City is required.", "city");

  req.data.plant = plant.trim().toUpperCase();
};

const onUpdatePlantMaster = async (req) => {
  if (req.data.plant)
    return req.error(
      400,
      "Plant code cannot be changed after creation.",
      "plant",
    );
  if (req.data.plantName === "")
    return req.error(400, "Plant name cannot be empty.", "plantName");
};

const onDeletePlantMaster = async (req) => {
  const { plant } = req.params[0];

  const hasInfoRecords = await SELECT.one
    .from("transaction.table.MaterialInfoRecord")
    .where({ plant_plant: plant });

  if (hasInfoRecords)
    return req.error(
      409,
      `Plant ${plant} cannot be deleted — linked material info records exist.`,
      "plant",
    );

  const hasPR = await SELECT.one
    .from("transaction.table.PurchaseRequisition")
    .where({ plant_plant: plant })
    .catch(() => null);

  if (hasPR)
    return req.error(
      409,
      `Plant ${plant} cannot be deleted — referenced by purchase requisitions.`,
      "plant",
    );
};

const onCreateStorageLocation = async (req) => {
  if (!req.data.storageLocation?.trim())
    return req.error(
      400,
      "Storage location code is required.",
      "storageLocation",
    );

  const plantExists = await SELECT.one
    .from(Plant)
    .where({ plant: req.data.plant_plant });

  if (!plantExists)
    return req.error(
      404,
      `Plant ${req.data.plant_plant} does not exist.`,
      "plant_plant",
    );
};

export {
  onCreatePlantMaster,
  onUpdatePlantMaster,
  onDeletePlantMaster,
  onCreateStorageLocation,
};
