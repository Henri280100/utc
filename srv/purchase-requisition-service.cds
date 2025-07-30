using {
    transaction.table as tt,
    master.table      as mt
} from '../db/schema';

service PurchaseRequisitionsService {
    @odata.draft.enabled
    entity PurchaseRequisition                  as projection on tt.PurchaseRequisition
        actions {
            // Bound Actions (instance-specific for line items)
            action approve()                    returns PurchaseRequisition;
            action reject(reason : String(500)) returns PurchaseRequisition;
            action edit()                       returns PurchaseRequisition;
            action release()                    returns PurchaseRequisition;
            action cancel()                     returns PurchaseRequisition;

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

    // Unbound Actions (collection-level)
    action createPurchaseRequisitionItem(purchaseRequisition : String(10),
                                         material : String(40),
                                         plant : String(4),
                                         quantity : Decimal(13, 3),
                                         deliveryDate : Date,
                                         purchasingGroup : String(3)) returns PurchaseRequisition;
}
