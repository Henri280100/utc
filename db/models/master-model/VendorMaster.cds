namespace master.table;
using {
    transaction.table.MaterialInfoRecord
} from '../../schema';
using {Country} from '@sap/cds/common';

entity VendorMaster {
    key supplier     : String(10);
        supplierName : String(35);
        country      : Country;
        city         : String(35);
        street       : String(35);
        infoRecords    : Composition of many MaterialInfoRecord on infoRecords.supplier = $self;
}
