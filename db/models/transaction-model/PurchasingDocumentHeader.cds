namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    master.table.VendorMaster,
    master.table.PurchasingGroups,
    transaction.table.PurchasingDocumentItem
} from '../../schema';

entity PurchasingDocumentHeader {
    key purchaseOrder      : String(10);
        documentCategory   : String(1);
        purchaseOrderType  : String(4);
        purchaseOrderItems : Composition of many PurchasingDocumentItem {
                                 purchaseOrder
                             };
        supplier           : Association to VendorMaster {supplier};
        purchasingGroup    : Association to PurchasingGroups {purchasingGroup};
        documentDate       : Date;
        currency           : Currency;
        paymentTerms       : String(4);
}
