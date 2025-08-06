namespace master.table;

using {Country} from '@sap/cds/common';
using {
    master.table.StorageLocations,
    transaction.table.MaterialInfoRecord
} from '../../schema';


entity Plant {
    key plant            : String(4);
        storageLocations : Composition of many StorageLocations
                               on storageLocations.plant = $self.plant;
        plantName        : String(30);
        city             : String(35);
        country          : Country;
        infoRecords      : Composition of many MaterialInfoRecord
                               on infoRecords.plant = $self;
}
