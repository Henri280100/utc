import { buildExpand } from "../common/query/BuildExpand.js";
import { PurchaseRequisitionTree } from "../common/query/Trees/PurchaseRequistion/PurchaseRequisitionTree.js";

const onCreatePurchaseRequisition = async (req, service) => {
  const { PurchaseRequisition } = service.entities;
  const { data } = req.data;

  if (!Array.isArray(data) || data.length === 0) {
    req.error(400, "Purchase requisition data is required.");
  }

  const today = new Date().toISOString().split("T")[0];

  /**
   * Generate unique PR number
   * Example:
   * PR250511001
   */
  const generatePRNumber = (index = 0) => {
    const now = new Date();

    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    // 2-digit random
    const random = String(Math.floor(Math.random() * 90) + 10);

    return `PR${yy}${mm}${dd}${random}`;
  };

  const records = data.map((item, index) => {
    if (!item.material_material) {
      req.error(400, "Material is mandatory.");
    }

    if (!item.plant_plant) {
      req.error(400, "Plant is mandatory.");
    }

    if (!item.quantity || Number(item.quantity) <= 0) {
      req.error(400, "Quantity must be greater than 0.");
    }

    if (!item.deliveryDate) {
      req.error(400, "Delivery date is mandatory.");
    }

    return {
      purchaseRequisition: generatePRNumber(index),

      purchaseReqnItem:
        item.purchaseReqnItem || String((index + 1) * 10).padStart(5, "0"),

      material_material: item.material_material,

      plant_plant: item.plant_plant,

      PurchasingGroup_purchasingGroup: item.PurchasingGroup_purchasingGroup,

      quantity: Number(item.quantity),

      baseUnit: item.baseUnit || "EA",

      deliveryDate: item.deliveryDate,

      requisitioner: item.requisitioner || req.user?.id || "SYSTEM",

      PurchaseRequisitionType: item.PurchaseRequisitionType || "NB",

      requisitionDate: today,

      /**
       * Status Handling
       */
      releaseStatus: "PENDING",

      /**
       * Reject Handling
       */
      rejectReason: null,

      /**
       * Created By Handling
       */
      createdByUser: req.user?.id || "SYSTEM",
    };
  });

  await INSERT.into(PurchaseRequisition).entries(records);

  const created = await SELECT.from(PurchaseRequisition)
    .where({
      purchaseRequisition: {
        in: records.map((r) => r.purchaseRequisition),
      },
    })
    .columns(buildExpand(PurchaseRequisitionTree));

  return created;
};
const onAutoGenerateKey = async (req) => {
  if (!req.data.purchaseRequisition) {
    req.data.purchaseRequisition = "PR" + Date.now().toString().slice(-8);
  }
  if (!req.data.purchaseReqnItem) {
    req.data.purchaseReqnItem = "00010";
  }
};

const onUpdateReleaseStatus = async (req, service) => {
  try {
    const { PurchaseRequisition } = service.entities;
    const { purchaseRequisition, purchaseReqnItem } = req.data;

    await UPDATE(PurchaseRequisition)
      .set({
        releaseStatus: "REL",
        rejectReason: null,
      })
      .where({
        purchaseRequisition,
        purchaseReqnItem,
      });

    return { message: "Release status updated to REL" };
  } catch (error) {
    return { error: "Failed to update release status", details: error.message };
  }
};

const onUpdateRejectReason = async (req, service) => {
  const { PurchaseRequisition } = service.entities;
  const { rejectReason } = req.data;
  const keys = req.params[0];

  await UPDATE(PurchaseRequisition)
    .set({
      releaseStatus: "REJ",
      rejectReason,
    })
    .where({
      purchaseRequisition: keys.purchaseRequisition,
      purchaseReqnItem: keys.purchaseReqnItem,
    });
  return await SELECT.one.from(PurchaseRequisition).where({
    purchaseRequisition: keys.purchaseRequisition,
    purchaseReqnItem: keys.purchaseReqnItem,
  });
};

const onApprovePurchaseRequisition = async (req, service) => {
  const { PurchaseRequisition } = service.entities;
  const keys = req.params[0];

  await UPDATE(PurchaseRequisition)
    .set({
      releaseStatus: "REL",
      rejectReason: null,
    })
    .where({
      purchaseRequisition: keys.purchaseRequisition,
      purchaseReqnItem: keys.purchaseReqnItem,
    });
  return await SELECT.one.from(PurchaseRequisition).where({
    purchaseRequisition: keys.purchaseRequisition,
    purchaseReqnItem: keys.purchaseReqnItem,
  });
};

export {
  onCreatePurchaseRequisition,
  onAutoGenerateKey,
  onUpdateReleaseStatus,
  onUpdateRejectReason,
  onApprovePurchaseRequisition,
};
