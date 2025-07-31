namespace transaction.table;


using {
    master.table.MaterialMaster,
    master.table.VendorMaster,
    master.table.PurchasingOrganizationData,
} from '../../schema';

entity PurchasingInfoRecord {
    key purchasingInfoRecord : String(10);
        material             : Association to MaterialMaster {
                                   material
                               };
        supplier             : Association to VendorMaster {
                                   supplier
                               };
        purchasingOrgData    : Composition of many PurchasingOrganizationData
                                   on purchasingOrgData.purchasingInfoRecord = $self.purchasingInfoRecord;
}
