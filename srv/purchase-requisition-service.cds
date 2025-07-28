using {
    transaction.table as tt,
    master.table      as mt
} from '../db/schema';

service PurchaseRequisitionsService {
    entity PurchaseRequisition                  as projection on tt.PurchaseRequisition;
    entity PurchaseRequisitionAccountAssignment as projection on tt.PurchaseRequisitionAccountAssignment;
    entity MaterialMaster                       as projection on mt.MaterialMaster;
    entity MaterialDescriptions                 as projection on mt.MaterialDescriptions;
    entity Plant                                as projection on mt.Plant;

    entity StorageLocations                     as projection on mt.StorageLocations;
    entity PurchasingGroups                     as projection on mt.PurchasingGroups;
    entity PurchasingDocumentTypes              as projection on mt.PurchasingDocumentTypes;

    entity PurchasingInfoRecord                 as projection on tt.PurchasingInfoRecord;
    entity PurchasingOrganization               as projection on mt.PurchasingOrganizationData;
    entity VendorMaster                         as projection on mt.VendorMaster;
}
