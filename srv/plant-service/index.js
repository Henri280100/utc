import cds from "@sap/cds";
import { onReadPlant } from "./PlantMasterRead";
import {
  onCreatePlantMaster,
  onCreateStorageLocation,
  onDeletePlantMaster,
  onUpdatePlantMaster,
} from "./PlantMasterWrite";
const LOG = cds.log("service.js");

export default function PlantServiceHandler(service) {
  const { Plant, StorageLocations } = service.entities;
  service.on("READ", Plant, async (req) => {
    try {
      return await onReadPlant(req, Plant);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("CREATE", Plant, async (req) => {
    try {
      return await onCreatePlantMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("UPDATE", Plant, async (req) => {
    try {
      return await onUpdatePlantMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("DELETE", Plant, async (req) => {
    try {
      return await onDeletePlantMaster(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.before("CREATE", StorageLocations, async (req) => {
    try {
      return await onCreateStorageLocation(req);
    } catch (error) {
      req.error(error.message);
      LOG.error(error.message);
      LOG.error(error.stack);
    }
  });

  service.after("CREATE", Plant, (data, req) => {
    LOG.info(`Plant created: ${data.plant} by ${req.user?.id ?? "SYSTEM"}`);
  });

  service.after("UPDATE", Plant, (data, req) => {
    LOG.info(
      `Plant updated: ${req.params[0]?.plant} by ${req.user?.id ?? "SYSTEM"}`,
    );
  });
}
