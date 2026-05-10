import { buildExpand } from "../common/query/BuildExpand";
import { PurchaseRequisitionTree } from "../common/query/Trees/PurchaseRequistion/PurchaseRequisitionTree";

const onCreatePurchaseRequisition = async (req, service) => {
  const { PurchaseRequisition } = service.entities;
  const { data } = req.data;

  // Generate PR number for each item
  const records = data.map((item, index) => ({
    ...item,
    purchaseRequisition: "PR" + Date.now().toString().slice(-8) + index,
    purchaseReqnItem: item.purchaseReqnItem || "00010",
    requisitionDate: new Date().toISOString().split("T")[0],
    createdByUser: req.user?.id || "SYSTEM",
    releaseStatus: "PENDING",
  }));

  await INSERT.into(PurchaseRequisition).entries(records);

  // Return with expanded associations
  const created = await SELECT.from(PurchaseRequisition)
    .where({
      purchaseRequisition: { in: records.map((r) => r.purchaseRequisition) },
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

export { onCreatePurchaseRequisition, onAutoGenerateKey };
