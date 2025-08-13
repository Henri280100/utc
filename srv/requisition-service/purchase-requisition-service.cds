using {
    transaction.table as tt,
    master.table      as mt
} from '../../db/schema';


service PurchaseRequisitionsService {
            @odata.draft.enabled
    entity PurchaseRequisition                  as projection on tt.PurchaseRequisition
        actions {
            @Core.OperationAvailable: {$value: in.IsActiveEntity}
            action approve()                               returns PurchaseRequisition;
            @Core.OperationAvailable: {$value: in.IsActiveEntity}
            action rejectOrder(rejectReason : String(255)) returns PurchaseRequisition;
        };

    entity PurchaseRequisitionAccountAssignment as projection on tt.PurchaseRequisitionAccountAssignment;

    entity MaterialMaster                       as projection on mt.MaterialMaster;

    entity MaterialDescriptions                 as projection on mt.MaterialDescriptions;

    entity Plant                                as projection on mt.Plant;

    entity StorageLocations                     as projection on mt.StorageLocations;
    entity PurchasingGroups                     as projection on mt.PurchasingGroups;
    entity PurchasingDocumentTypes              as projection on mt.PurchasingDocumentTypes;


    entity PurchasingOrganization               as projection on mt.PurchasingOrganizationData;
    entity VendorMaster                         as projection on mt.VendorMaster;

    entity PurchasingInfoRecord                 as projection on tt.PurchasingInfoRecord;

}
