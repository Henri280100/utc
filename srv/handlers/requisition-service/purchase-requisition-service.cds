using {
    transaction.table as tt,
    master.table      as mt
} from '../../../db/schema';

@impl: 'srv/handlers/service.js'
service PurchaseRequisitionsService {

    entity PurchaseRequisition     as projection on tt.PurchaseRequisition
        actions {

            @Core.OperationAvailable: {$edmJson: {$And: [
                {$Ne: [
                    {$Path: 'releaseStatus'},
                    'REL'
                ]},
                {$Ne: [
                    {$Path: 'releaseStatus'},
                    'REJ'
                ]},
                {$Eq: [{
                    $Path: 'IsActiveEntity',
                    false
                }]}

            ]}}
            action approve()                              returns PurchaseRequisition;

            @Core.OperationAvailable: {$edmJson: {$And: [
                {$Ne: [
                    {$Path: 'releaseStatus'},
                    'REL'
                ]},
                {$Ne: [
                    {$Path: 'releaseStatus'},
                    'REJ'
                ]},
                {$Eq: [{
                    $Path: 'IsActiveEntity',
                    false
                }]}
            ]}}
            action rejectOrder(rejectReason: String(255)) returns PurchaseRequisition;


        };

    
    entity MaterialMaster          as projection on mt.MaterialMaster;

    entity Plant                   as projection on mt.Plant;

    entity StorageLocations        as projection on mt.StorageLocations;
    entity PurchasingGroups        as projection on mt.PurchasingGroups;
    entity PurchasingDocumentTypes as projection on mt.PurchasingDocumentTypes;


    entity PurchasingOrganization  as projection on mt.PurchasingOrganizationData;

    @readonly
    entity VendorMaster            as projection on mt.VendorMaster;

    @readonly
    entity PurchasingInfoRecord    as projection on tt.PurchasingInfoRecord;

    action createPurchaseRequisition(data: many PurchaseRequisition)                               returns many PurchaseRequisition;
    action releasePurchaseRequisition(purchaseRequisition: String(10), purchaseReqnItem: String(5)) returns Boolean;
}
