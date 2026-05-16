using {master.table as master} from '../../db/schema';

@impl: 'srv/handlers/service.js'
@(
    path: '/plant-masters',
)
service PlantService {

    entity Plant as
        projection on master.Plant {
            key plant,
                plantName,
                city,
                country,
                storageLocations,
                infoRecords
        };

    entity StorageLocations as
        projection on master.StorageLocations;
}
