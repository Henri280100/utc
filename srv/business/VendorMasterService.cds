using {master.table as master} from '../../db/schema';

@impl: 'srv/handlers/service.js'
@(
    path: '/vendor-masters',
)
service VendorMasterService {

    entity VendorMaster as
        projection on master.VendorMaster {
            *,
            country,
            materialInfoRecords
        };
}
