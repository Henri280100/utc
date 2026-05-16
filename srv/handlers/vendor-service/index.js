import cds from "@sap/cds";
import { onReadVendorMaster } from "./VendorMasterRead.js";
import {
  onCreateVendorMaster,
  onUpdateVendorMaster,
  onDeleteVendorMaster,
} from "./VendorMasterWrite.js";

const LOG = cds.log("service.js");

export default function (service) {
  if (service.name !== "VendorMasterService") {
    return;
  }

  const { VendorMaster } = service.entities || {};

  if (!VendorMaster) {
    console.error("❌ VendorMaster entity not found!");
    return;
  }

  service.on("READ", VendorMaster, async (req) => {
    try {
      return await onReadVendorMaster(req, VendorMaster);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("CREATE", VendorMaster, async (req) => {
    try {
      return await onCreateVendorMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("UPDATE", VendorMaster, async (req) => {
    try {
      return await onUpdateVendorMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("DELETE", VendorMaster, async (req) => {
    try {
      return await onDeleteVendorMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.after("CREATE", VendorMaster, (data, req) => {
    LOG.info(
      `Vendor created: ${data.supplier} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });

  service.after("UPDATE", VendorMaster, (data, req) => {
    LOG.info(
      `Vendor updated: ${req.params[0]?.supplier} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });
}
