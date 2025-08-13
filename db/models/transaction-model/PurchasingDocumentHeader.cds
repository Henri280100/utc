namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    master.table.VendorMaster,
    master.table.PurchasingGroups,
    transaction.table.PurchasingDocumentItem
} from '../../schema';

entity PurchasingDocumentHeader {
    key purchaseOrder          : String(10);
        documentCategory       : String(1);

        @mandatory
        purchaseOrderType      : String(4);
        // Restore the composition
        purchasingDocumentItem : Composition of many PurchasingDocumentItem
                                     on purchasingDocumentItem.purchaseOrder = $self.purchaseOrder;

        @mandatory
        supplier               : Association to VendorMaster {
                                     supplier
                                 };

        purchasingGroup        : Association to PurchasingGroups {
                                     purchasingGroup
                                 };

        @mandatory
        documentDate           : Date;

        @mandatory
        currency               : Currency;
        paymentTerms           : String(4);
}
