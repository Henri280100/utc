namespace transaction.table;

using {
    transaction.table.PurchasingDocumentHeader,
    transaction.table.PurchasingDocumentItem,
    master.table.MaterialMaster
} from '../../schema';


entity SupplierInvoiceItem {
    key supplierInvoice     : String(10);
    key supplierInvoiceItem : String(6);
        purchaseOrder       : Association to PurchasingDocumentHeader {
                                  purchaseOrder
                              };
        purchaseOrderItem   : Association to PurchasingDocumentItem {
                                  purchaseOrderItem
                              };
        material            : Association to MaterialMaster {
                                  material
                              };
        quantity            : Decimal(13, 3);
        baseUnit            : String(5);
        amount              : Decimal(13, 2)
}
