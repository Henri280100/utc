namespace transaction.table;


using {transaction.table.AccountingDocumentItem} from '../../schema';

entity AccountingDocumentHeader {
    key accountingDocument      : String(10);
    key fiscalYear              : String(4);
        accountingDocumentItems : Composition of many AccountingDocumentItem {
                                      accountingDocument, fiscalYear
                                  };
        documentType            : String(2);
        documentDate            : Date;
        companyCode             : String(4);
}
