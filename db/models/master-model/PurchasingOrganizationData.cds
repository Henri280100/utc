namespace master.table;

using {transaction.table.MaterialInfoRecord, } from '../../schema';

// Purchasing Info Record Org Data
entity PurchasingOrganizationData {
    key purchasingInfoRecord   : String(10);
    key purchasingOrganization : String(4);
        netPrice               : Decimal(11, 2);
        priceUnit              : Decimal(5, 0);
        conditions             : Composition of many MaterialInfoRecord
                                     on conditions.purchasingOrganization = $self.purchasingOrganization;
}
