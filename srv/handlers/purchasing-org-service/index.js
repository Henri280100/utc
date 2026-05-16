import cds from "@sap/cds";
import { onReadPurchasingOrganization } from "./PurchasingOrganizationRead.js";
import {
  onCreatePurchasingOrgData,
  onUpdatePurchasingOrgData,
  onDeletePurchasingOrgData,
} from "./PurchasingOrganizationWrite.js";

const LOG = cds.log("service.js");

export default function (service) {
  if (service.name !== "PurchasingOrganizationService") {
    return;
  }

  const { PurchasingOrganizationData } = service.entities || {};

  if (!PurchasingOrganizationData) {
    console.error("❌ PurchasingOrganizationData entity not found!");
    return;
  }

  service.on("READ", PurchasingOrganizationData, async (req) => {
    try {
      return await onReadPurchasingOrganization(req, PurchasingOrganizationData);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("CREATE", PurchasingOrganizationData, async (req) => {
    try {
      return await onCreatePurchasingOrgData(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("UPDATE", PurchasingOrganizationData, async (req) => {
    try {
      return await onUpdatePurchasingOrgData(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("DELETE", PurchasingOrganizationData, async (req) => {
    try {
      return await onDeletePurchasingOrgData(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.after("CREATE", PurchasingOrganizationData, (data, req) => {
    LOG.info(
      `Purchasing org created: ${data.purchasingOrganization}/${data.purchasingInfoRecord} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });

  service.after("UPDATE", PurchasingOrganizationData, (data, req) => {
    LOG.info(
      `Purchasing org updated: ${req.params[0]?.purchasingOrganization}/${req.params[0]?.purchasingInfoRecord} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });
}
