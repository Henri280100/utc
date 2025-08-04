using {
    transaction.table as tt,
    master.table      as mt
} from '../db/schema';

service PurchasingInfoRecordsService {
    @odata.draft.enabled
    entity PurchasingInfoRecord       as projection on tt.PurchasingInfoRecord;

    entity PurchasingOrganizationData as projection on mt.PurchasingOrganizationData;


    entity MaterialInfoRecord         as projection on tt.MaterialInfoRecord;
    entity MaterialMaster             as projection on mt.MaterialMaster;
    entity MaterialDescriptions       as projection on mt.MaterialDescriptions;
    entity VendorMaster               as projection on mt.VendorMaster;

    entity Plant                      as projection on mt.Plant;
}
