namespace master.table;


using {
    master.table.MaterialDescriptions,
    master.table.MaterialGroups,
    master.table.MaterialPlantData,
    transaction.table.MaterialInfoRecord
} from '../../schema';

entity MaterialMaster {
    key material             : String(40);
        materialType         : String(4);
        industrySector       : String(1);
        baseUnit             : String(3);
        materialGroup        : Association to MaterialGroups;
        creationDate         : Date;
        materialDescriptions : Composition of many MaterialDescriptions
                                   on materialDescriptions.material = $self.material;
        plantData            : Composition of many MaterialPlantData {
                                   material
                               };
        infoRecords          : Composition of many MaterialInfoRecord
                                   on infoRecords.material = $self;
}
