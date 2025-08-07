namespace transaction.table;


using {
    master.table.PurchasingGroups,
    master.table.MaterialMaster,
    master.table.Plant,
    transaction.table.PurchaseRequisitionAccountAssignment,
    transaction.table.PurchasingInfoRecord
} from '../../schema';


entity PurchaseRequisition {
    key purchaseRequisition     : String(10);
    key purchaseReqnItem        : String(5);

        @mandatory
        material                : Association to MaterialMaster;

        @mandatory
        plant                   : Association to Plant;
        storageLocation         : String(4);

        @mandatory
        quantity                : Decimal(13, 3);
        baseUnit                : String(3);

        @mandatory
        deliveryDate            : Date;
        requisitioner           : String(12);
        releaseStatus           : String(8);

        @mandatory
        PurchasingGroup         : Association to PurchasingGroups;
        PurchaseRequisitionType : String(4);
        requisitionDate         : Date;
        createdByUser           : String @cds.on.insert: $user;
        accountAssignment       : Composition of many PurchaseRequisitionAccountAssignment
                                      on  accountAssignment.purchaseRequisition = $self.purchaseRequisition
                                      and accountAssignment.purchaseReqnItem    = $self.purchaseReqnItem;
        purchasingInfoRecords   : Composition of many PurchasingInfoRecord
                                      on purchasingInfoRecords.material = $self.material;
}
