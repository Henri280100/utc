import cds from "@sap/cds";
import { onReadPurchaseRequisition } from "./PurchaseRequisitionRead";

const LOG = cds.log("service.js");

export default function PurchaseRequisitionService(service) {
  const { PurchaseRequisition } = service.entities;

  service.on("createPurchaseRequisition", async (req, service) => {
    try {
      return await onCreatePurchaseRequisition(req, service);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // Before Create - Auto-generate key if needed
  service.before("CREATE", PurchaseRequisition, async (req) => {
    try {
      return await onAutoGenerateKey(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // After Read - Expand associations
  service.on("READ", PurchaseRequisition, async (req) => {
    try {
      return await onReadPurchaseRequisition(req, PurchaseRequisition);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // Custom Action: Release PR
  service.on("releasePurchaseRequisition", async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.data;

    await cds.run(
      UPDATE(PurchaseRequisition)
        .set({ releaseStatus: "Released" })
        .where({ purchaseRequisition, purchaseReqnItem }),
    );

    return true;
  });

  console.log("✅ PurchaseRequisitionService handler loaded");
}
