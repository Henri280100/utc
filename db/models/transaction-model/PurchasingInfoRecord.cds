namespace transaction.table;


using {
    master.table.MaterialMaster,
    master.table.VendorMaster,
    master.table.PurchasingOrganizationData
} from '../../schema';

entity PurchasingInfoRecord {
    key purchasingInfoRecord : String(10);

        @mandatory
        material             : Association to MaterialMaster {
                                   material
                               };

        @mandatory
        supplier             : Association to VendorMaster {
                                   supplier
                               };
        purchasingOrgData    : Composition of PurchasingOrganizationData
                                   on purchasingOrgData.purchasingInfoRecord = $self.purchasingInfoRecord;
}
