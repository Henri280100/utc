const cds = require("@sap/cds");

module.exports = async (srv) => {
  const {
    MaterialDocument,
    PurchasingDocumentItem,
    PurchasingRequisition,
    MaterialMaster,
    MaterialDescriptions,
    Plant,
    StorageLocations,
  } = srv.entities;

  // Helper function to validate mandatory fields
  async function validateMandatoryFields(data, req) {
    const mandatoryFields = [
      "material_material",
      "plant_plant",
      "storageLocation",
      "quantity",
      "purchaseOrderItem_purchaseOrder",
      "movementType",
    ];
    for (const field of mandatoryFields) {
      if (!data[field]) {
        req.error(400, `Mandatory field ${field} is missing`);
        return false;
      }
    }
    return true;
  }

  // Helper function to validate material (MARA)
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
        `Material ${data.material_material} not found in MaterialMaster (MARA)`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate plant (T001W)
  async function validatePlant(data, tx, req) {
    if (!data.plant_plant) return true;
    const plant = await tx.run(
      SELECT.one.from(Plant).where({ plant: data.plant_plant })
    );
    if (!plant) {
      req.error(400, `Plant ${data.plant_plant} not found in Plant (T001W)`);
      return false;
    }
    return true;
  }

  // Helper function to validate storage location (T001L)
  async function validateStorageLocation(data, tx, req) {
    if (!data.storageLocation || !data.plant_plant) return true;
    const storageLoc = await tx.run(
      SELECT.one.from(StorageLocations).where({
        plant: data.plant_plant,
        storageLocation: data.storageLocation,
      })
    );
    if (!storageLoc) {
      req.error(
        400,
        `Storage location ${data.storageLocation} does not exist for plant ${data.plant_plant} in StorageLocation (T001L)`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate purchase order and item (EKPO)
  async function validatePurchaseOrder(data, tx, req) {
    if (!data.purchaseOrder || !data.purchaseOrderItem) return true;
    const poItem = await tx.run(
      SELECT.one.from(PurchaseOrderItem).where({
        purchaseOrder: data.purchaseOrder,
        purchaseOrderItem: data.purchaseOrderItem,
      })
    );
    if (!poItem) {
      req.error(
        400,
        `Purchase order ${data.purchaseOrder}/${data.purchaseOrderItem} not found in PurchaseOrderItem (EKPO)`
      );
      return false;
    }
    return poItem;
  }

  // Helper function to validate quantity
  async function validateQuantity(data, poItem, req) {
    if (data.quantity === undefined) return true;
    if (data.quantity <= 0) {
      req.error(
        400,
        `Quantity for material document item ${data.materialDocItem} must be positive`
      );
      return false;
    }
    if (poItem && data.quantity > poItem.quantity) {
      req.error(
        400,
        `Quantity ${data.quantity} for material document item ${data.materialDocItem} exceeds ordered quantity ${poItem.quantity} in EKPO`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate movement type
  async function validateMovementType(data, req) {
    if (!data.movementType) return true;
    const validMovementTypes = ["101", "102", "103", "104", "105", "106"]; // Example valid values
    if (!validMovementTypes.includes(data.movementType)) {
      req.error(
        400,
        `Invalid movement type ${
          data.movementType
        }. Valid values: ${validMovementTypes.join(", ")}`
      );
      return false;
    }
    return true;
  }

  // Helper function to validate received quantity against EKPO
  async function validateReceivedQuantity(data, tx, req) {
    if (
      !data.purchaseOrder ||
      !data.purchaseOrderItem ||
      data.quantity === undefined
    )
      return true;

    // Fetch the purchase order item
    const poItem = await tx.run(
      SELECT.one.from(PurchaseOrderItem).where({
        purchaseOrder: data.purchaseOrder,
        purchaseOrderItem: data.purchaseOrderItem,
      })
    );
    if (!poItem) {
      req.error(
        400,
        `Purchase order ${data.purchaseOrder}/${data.purchaseOrderItem} not found in PurchaseOrderItem (EKPO)`
      );
      return false;
    }

    // Sum existing received quantities for this purchase order item
    const existingDocs = await tx.run(
      SELECT.from(MaterialDocument).where({
        purchaseOrder: data.purchaseOrder,
        purchaseOrderItem: data.purchaseOrderItem,
      })
    );
    const totalReceived = existingDocs.reduce(
      (sum, doc) => sum + (doc.quantity || 0),
      0
    );

    // Include the new quantity from the update
    const newTotalReceived = totalReceived + data.quantity;

    console.log(
      `validateReceivedQuantity - PO: ${data.purchaseOrder}/${data.purchaseOrderItem}, Ordered: ${poItem.quantity}, Previously Received: ${totalReceived}, New Total: ${newTotalReceived}`
    );

    if (newTotalReceived > poItem.quantity) {
      req.error(
        400,
        `Total received quantity ${newTotalReceived} for purchase order ${data.purchaseOrder}/${data.purchaseOrderItem} exceeds ordered quantity ${poItem.quantity} in EKPO`
      );
      return false;
    }
    return true;
  }

  // Before UPDATE handler for MaterialDocument
  srv.before("UPDATE", MaterialDocument, async (req) => {
    const data = req.data;
    const tx = cds.transaction(req);

    try {
      // Validate mandatory fields
      if (!(await validateMandatoryFields(data, req))) {
        return;
      }

      // Validate Material (MARA)
      if (!(await validateMaterial(data, tx, req))) {
        return;
      }

      // Validate Plant (T001W)
      if (!(await validatePlant(data, tx, req))) {
        return;
      }

      // Validate Storage Location (T001L)
      if (!(await validateStorageLocation(data, tx, req))) {
        return;
      }

      // Validate Purchase Order and Item (EKPO)
      const poItem = await validatePurchaseOrder(data, tx, req);
      if (data.purchaseOrder && data.purchaseOrderItem && !poItem) {
        return;
      }

      // Validate Quantity
      if (!(await validateQuantity(data, poItem, req))) {
        return;
      }

      // Validate Movement Type
      if (!(await validateMovementType(data, req))) {
        return;
      }

      // Validate Received Quantity against EKPO
      if (!(await validateReceivedQuantity(data, tx, req))) {
        return;
      }
    } catch (error) {
      req.error(500, `Error validating material document: ${error.message}`);
    }
  });
};
