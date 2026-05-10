using {master.table as master} from '../../db/schema';

service MasterDataService {

    // ── Material Master ──────────────────────────────────────
    entity MaterialMaster       as
        projection on master.MaterialMaster {
            *,
            materialGroup,
            materialDescriptions,
            plantData
        };

    entity MaterialDescriptions as projection on master.MaterialDescriptions;

    entity MaterialGroups       as projection on master.MaterialGroups;

    entity MaterialPlantData    as projection on master.MaterialPlantData;

    // ── Plant ────────────────────────────────────────────────
    entity Plant                as
        projection on master.Plant {
            *,
            storageLocations,
            country
        };

    entity StorageLocations     as projection on master.StorageLocations;
}
