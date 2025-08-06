using {
    transaction.table as tt,
    master.table      as mt
} from '../../db/schema';

service SupplierProcessingService {
    @odata.draft.enabled
    entity SupplierInvoiceHeader    as projection on tt.SupplierInvoiceHeader;

    entity SupplierInvoiceItem      as projection on tt.SupplierInvoiceItem;
    entity AccountingDocumentHeader as projection on tt.AccountingDocumentHeader;
    entity AccountingDocumentItem   as projection on tt.AccountingDocumentItem;

    entity PurchasingDocumentHeader as projection on tt.PurchasingDocumentHeader;
    entity PurchasingDocumentItem   as projection on tt.PurchasingDocumentItem;

    entity MaterialDocument         as projection on tt.MaterialDocument;
    entity MaterialMaster           as projection on mt.MaterialMaster;
    entity MaterialDescriptions     as projection on mt.MaterialDescriptions;

    entity VendorMaster             as projection on mt.VendorMaster;
}
