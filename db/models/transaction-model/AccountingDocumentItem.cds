namespace transaction.table;

using {Currency} from '@sap/cds/common';

using {
    transaction.table.SupplierInvoiceHeader,
    transaction.table.SupplierInvoiceItem,
} from '../../schema';

entity AccountingDocumentItem {
    key accountingDocument     : String(10);
    key fiscalYear             : String(4);
    key accountingDocumentItem : String(6);
        supplierInvoice        : Association to one SupplierInvoiceHeader;
        invoiceItem            : Association to one SupplierInvoiceItem;
        glAccount              : String(10);
        costCenter             : String(10);
        amount                 : Decimal(13, 2);
        currency               : Currency;
}
