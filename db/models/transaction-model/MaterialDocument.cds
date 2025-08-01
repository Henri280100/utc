namespace transaction.table;

using {
    master.table.MaterialMaster,
    master.table.Plant,
    transaction.table.PurchasingDocumentItem
} from '../../schema';

entity MaterialDocument {
    key materialDocNumber : String(10);
    key materialDocYear   : String(4);
    key materialDocItem   : String(4);
        material          : Association to MaterialMaster {
                                material
                            };
        plant             : Association to Plant {
                                plant
                            };
        storageLocation   : String(4);
        quantity          : Decimal(13, 3);
        baseUnit          : String(3);
        purchaseOrderItem : Association to PurchasingDocumentItem {
                                purchaseOrder, purchaseOrderItem
                            };
        movementType      : String(5);
}
