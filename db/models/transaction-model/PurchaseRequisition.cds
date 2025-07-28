namespace transaction.table;


using {
    master.table.PurchasingGroups,
    master.table.MaterialMaster,
    master.table.Plant,
    transaction.table.PurchaseRequisitionAccountAssignment,
    transaction.table.PurchasingInfoRecord,
} from '../../schema';


entity PurchaseRequisition {
    key purchaseRequisition     : String(10);
    key purchaseReqnItem        : String(5);
        Material                : Association to MaterialMaster;
        plant                   : Association to Plant;
        storageLocation         : String(4);
        quantity                : Decimal(13, 3);
        baseUnit                : String(3);
        deliveryDate            : Date;
        requisitioner           : String(12);
        releaseStatus           : String(8);
        PurchasingGroup         : Association to PurchasingGroups;
        PurchaseRequisitionType : String(4);
        requisitionDate         : Date;
        createdByUser           : String @cds.on.insert: $user;
        accountAssignments      : Composition of many PurchaseRequisitionAccountAssignment {
                                      purchaseRequisition, purchaseReqnItem
                                  };
        purchasingInfoRecords   : Association to many PurchasingInfoRecord
                                      on purchasingInfoRecords.material = Material;
}
