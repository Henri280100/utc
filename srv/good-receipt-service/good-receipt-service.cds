using {
    transaction.table as tt,
    master.table      as mt
} from '../../db/schema';

service GoodReceiptService {
    @odata.draft.enabled
    entity MaterialDocument     as projection on tt.MaterialDocument;
    entity PurchasingDocumentItem       as projection on tt.PurchasingDocumentItem;
    entity PurchasingRequisition        as projection on tt.PurchaseRequisition;
    entity MaterialMaster             as projection on mt.MaterialMaster;
    entity MaterialDescriptions       as projection on mt.MaterialDescriptions;
    entity Plant                      as projection on mt.Plant;
    entity StorageLocations           as projection on mt.StorageLocations;
    
}