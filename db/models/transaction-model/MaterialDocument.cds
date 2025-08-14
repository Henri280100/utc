namespace transaction.table;

using {
    master.table.MaterialMaster,
    master.table.Plant,
    transaction.table.PurchasingDocumentItem,
    transaction.table.SupplierInvoiceHeader
} from '../../schema';

entity MaterialDocument {
    key materialDocNumber : String(10);
    key materialDocYear   : String(4);
    key materialDocItem   : String(4);
        supplierInvoice   : Association to SupplierInvoiceHeader;

        @mandatory
        material          : Association to MaterialMaster {
                                material
                            };

        @mandatory
        plant             : Association to Plant {
                                plant
                            };
        storageLocation   : String(4);

        @mandatory
        quantity          : Decimal(13, 3);
        baseUnit          : String(3);

        @mandatory
        purchaseOrderItem : Association to PurchasingDocumentItem {
                                purchaseOrder, purchaseOrderItem
                            };

        @mandatory
        movementType      : String(5);
}
