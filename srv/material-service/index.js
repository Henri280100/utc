import cds from "@sap/cds";
import { onReadMaterialMaster } from "./MaterialMasterRead";
import {
  onCreateMaterialMaster,
  onDeleteMaterialMaster,
  onUpdateMaterialMaster,
} from "./MaterialMasterWrite";

const LOG = cds.log("service.js");

export default function MaterialMasterService(service) {
  const { MaterialMaster } = service.entities;

  service.on("READ", MaterialMaster, async (req) => {
    try {
      return await onReadMaterialMaster(req, MaterialMaster);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // ── BEFORE CREATE ───────────────────────────────────────────
  service.before("CREATE", MaterialMaster, async (req) => {
    try {
      return await onCreateMaterialMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // ── BEFORE UPDATE ───────────────────────────────────────────
  service.before("UPDATE", MaterialMaster, async (req) => {
    try {
      return await onUpdateMaterialMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // ── BEFORE DELETE ───────────────────────────────────────────
  service.before("DELETE", MaterialMaster, async (req) => {
    try {
      return await onDeleteMaterialMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  // ── AFTER CREATE / UPDATE ───────────────────────────────────
  service.after("CREATE", MaterialMaster, (data, req) => {
    LOG.info(
      `Material created: ${data.material} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });

  service.after("UPDATE", MaterialMaster, (data, req) => {
    LOG.info(
      `Material updated: ${req.params[0]?.material} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });
}
