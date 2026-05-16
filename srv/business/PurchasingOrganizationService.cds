using {master.table as master} from '../../db/schema';

@impl: 'srv/handlers/service.js'
@(
    path: '/purchasing-organizations',
)
service PurchasingOrganizationService {

    entity PurchasingOrganizationData as
        projection on master.PurchasingOrganizationData {
            *,
            infoRecords
        };
}
