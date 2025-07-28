namespace transaction.table;

using {
    master.table.VendorMaster,
    master.table.MaterialMaster,
    master.table.Plant
} from '../../schema';

// Purchasing Conditions
entity MaterialInfoRecord {
    key application            : String(2);
    key conditionType          : String(4);
    key supplier               : Association to VendorMaster {supplier};
    key material               : Association to MaterialMaster {material};
    key purchasingOrganization : String(4);
    key plant                  : Association to Plant {plant};
        purchaseContract         : String(10)
}
