import cds from "@sap/cds";
import { onReadPurchaseRequisition } from "./PurchaseRequisitionRead.js";
import {
  onApprovePurchaseRequisition,
  onAutoGenerateKey,
  onCreatePurchaseRequisition,
  onUpdateRejectReason,
  onUpdateReleaseStatus,
} from "./PurchaseRequisitionWrite.js";

const LOG = cds.log("service.js");

export default function (service) {
  const { PurchaseRequisition } = service.entities || {};
  service.on("createPurchaseRequisition", async (req) => {
    try {
      return await onCreatePurchaseRequisition(req, service);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // After Read - Expand associations
  service.on("READ", PurchaseRequisition, async (req) => {
    try {
      return await onReadPurchaseRequisition(req, service);
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

  // Custom Actions (target must be provided, otherwise CAP registers with an undefined path)
  service.on("releasePurchaseRequisition", async (req) => {
    try {
      return await onUpdateReleaseStatus(req, service);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.on("rejectOrder", PurchaseRequisition, async (req) => {
    try {
      return await onUpdateRejectReason(req, service);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.on("approve", PurchaseRequisition, async (req) => {
    try {
      return await onApprovePurchaseRequisition(req, service);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });
}
