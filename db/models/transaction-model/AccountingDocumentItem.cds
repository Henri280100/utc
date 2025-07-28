namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    master.table.VendorMaster,
    transaction.table.SupplierInvoiceHeader,
    transaction.table.SupplierInvoiceItem,
} from '../../schema';

entity AccountingDocumentItem {
    key accountingDocument     : String(10);
    key fiscalYear             : String(4);
    key accountingDocumentItem : String(3);
        supplier               : Association to VendorMaster {
                                     supplier
                                 };
        supplierInvoice        : Association to SupplierInvoiceHeader {
                                     supplierInvoice, fiscalYear
                                 };
        invoiceItem            : Association to SupplierInvoiceItem {
                                     supplierInvoice, supplierInvoiceItem
                                 };
        glAccount              : String(10);
        amount                 : Decimal(13, 2);
        currency               : Currency;
}
