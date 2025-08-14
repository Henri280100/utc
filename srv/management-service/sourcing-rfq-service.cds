using {
    transaction.table as tt,
    master.table      as mt
} from '../../db/schema';

// Manage and view all the main data
service SourcingRFQService {
    entity PurchasingDocumentHeader   as projection on tt.PurchasingDocumentHeader;

    entity PurchasingDocumentItem     as projection on tt.PurchasingDocumentItem;
    entity VendorMaster               as projection on mt.VendorMaster;
    entity PurchasingDocumentTypes    as projection on mt.PurchasingDocumentTypes;
    entity PurchasingInfoRecord       as projection on tt.PurchasingInfoRecord;
    entity PurchasingOrganizationData as projection on mt.PurchasingOrganizationData;
}
