namespace master.table;

using {transaction.table.PurchasingInfoRecord} from '../../schema';

// Purchasing Info Record Org Data
entity PurchasingOrganizationData {
    key purchasingOrganization : String(4);
    key purchasingInfoRecord   : String(10);
        netPrice               : Decimal(11, 2);
        priceUnit              : Decimal(5, 0);
        infoRecords            : Association to PurchasingInfoRecord
}
