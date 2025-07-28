namespace master.table;

using {master.table.Plant} from '../../schema';

entity MaterialPlantData {
    key material     : String(40);
    key plant        : Association to Plant;
        mrpType      : String(2);
        reorderPoint : Decimal(13, 3)
}
