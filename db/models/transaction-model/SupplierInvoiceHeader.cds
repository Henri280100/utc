namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    master.table.VendorMaster,
    transaction.table.SupplierInvoiceItem
} from '../../schema';

entity SupplierInvoiceHeader {
    key supplierInvoice     : String(10);
    key fiscalYear          : String(4);
        supplierInvoiceItem : Composition of many SupplierInvoiceItem {
                                  supplierInvoice
                              };
        supplier            : Association to VendorMaster;
        documentDate        : Date;
        grossAmount         : Decimal(13, 2);
        currency            : Currency;

}
