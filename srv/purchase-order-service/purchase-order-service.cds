using {
    transaction.table as tt,
    master.table      as mt
} from '../../db/schema';

service PurchaseOrderService {
    @odata.draft.enabled
    entity PurchaseDocumentHeader     as projection on tt.PurchasingDocumentHeader;

    entity PurchaseDocumentItem       as projection on tt.PurchasingDocumentItem;

    entity PurchaseRequisition        as projection on tt.PurchaseRequisition;

    entity MaterialMaster             as projection on mt.MaterialMaster;
    entity MaterialDescriptions       as projection on mt.MaterialDescriptions;
    entity Plant                      as projection on mt.Plant;
    entity StorageLocations           as projection on mt.StorageLocations;
    entity PurchasingGroups           as projection on mt.PurchasingGroups;
    entity PurchasingDocumentTypes    as projection on mt.PurchasingDocumentTypes;
    entity VendorMaster               as projection on mt.VendorMaster;
    entity PurchasingInfoRecord       as projection on tt.PurchasingInfoRecord;
    entity PurchasingOrganizationData as projection on mt.PurchasingOrganizationData;
}
