namespace master.table;

using {Country} from '@sap/cds/common';

entity VendorMaster {
    key supplier     : String(10);
        supplierName : String(35);
        country      : Country;
        city         : String(35);
        street       : String(35)
}
