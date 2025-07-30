namespace transaction.table;

using {
    transaction.table.PurchaseRequisition,
    master.table.MaterialMaster,
    master.table.Plant
} from '../../schema';


entity PurchasingDocumentItem {
    key purchaseOrder       : String(10);
    key purchaseOrderItem   : String(5);
        material            : Association to MaterialMaster {material};
        plant               : Association to Plant {
                                  plant
                              };
        storageLocation     : String(4);
        quantity            : Decimal(13, 3);
        baseUnit            : String(3);
        netPrice            : Decimal(11, 2);
        purchaseRequisition : Association to PurchaseRequisition {
                                  purchaseRequisition
                              }
}
