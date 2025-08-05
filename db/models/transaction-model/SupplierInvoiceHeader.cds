namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    master.table.VendorMaster,
    transaction.table.SupplierInvoiceItem
} from '../../schema';

entity SupplierInvoiceHeader {
        
    key supplierInvoice     : String(10);
    key fiscalYear          : String(4);
        supplierInvoiceItem : Composition of many SupplierInvoiceItem
                                  on supplierInvoiceItem.supplierInvoice = $self.supplierInvoice;
        @mandatory
        supplier            : Association to VendorMaster;
        @mandatory
        documentDate        : Date;
        @mandatory
        grossAmount         : Decimal(13, 2);
        @mandatory
        currency            : Currency;

}
