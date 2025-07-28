using PurchaseRequisitionsService as service from '../../srv/purchase-requisition-service';

annotate service.PurchaseRequisition with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'purchaseRequisition',
                Value: purchaseRequisition,
            },
            {
                $Type: 'UI.DataField',
                Label: 'purchaseReqnItem',
                Value: purchaseReqnItem,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Material}',
                Value: Material_material,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Plant}',
                Value: plant_plant,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>StorageLocation}',
                Value: storageLocation,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Quantity}',
                Value: quantity,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>BaseUnit}',
                Value: baseUnit,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>DeliveryDate}',
                Value: deliveryDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'requisitioner',
                Value: requisitioner,
            },
            {
                $Type: 'UI.DataField',
                Label: 'releaseStatus',
                Value: releaseStatus,
            },
            {
                $Type: 'UI.DataField',
                Label: 'PurchasingGroup_purchasingGroup',
                Value: PurchasingGroup_purchasingGroup,
            },
            {
                $Type: 'UI.DataField',
                Label: 'PurchaseRequisitionType',
                Value: PurchaseRequisitionType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'requisitionDate',
                Value: requisitionDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'createdByUserIn',
                Value: createdByUser,
            },
        ],
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Account Assignment',
            Target: 'accountAssignments/@UI.LineItem#AccountAssignments'
        },
        // Material Details (MARA, MAKT)
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Material Details',
            Target: '@UI.FieldGroup#MaterialDetails'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Supplier Information',
            Target: 'purchasingInfoRecords/@UI.LineItem#SupplierInfo'
        }
    ],

    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>PurchaseRequisition}',
            Value: purchaseRequisition,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Material}',
            Value: Material_material,
        },
        {
            $Type: 'UI.DataField',
            Value: Material.materialDescriptions_material,
            Label: '{i18n>MaterialDescription1}',
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Plant}',
            Value: plant_plant,
        },
        {
            $Type: 'UI.DataField',
            Value: quantity,
            Label: '{i18n>Quantity}',
        },
        {
            $Type: 'UI.DataField',
            Value: deliveryDate,
            Label: '{i18n>DeliveryDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: releaseStatus,
        },
    ],
    UI.SelectionFields           : [
        Material_material,
        plant_plant,
        PurchasingGroup_purchasingGroup,
        releaseStatus,
        requisitionDate,
    ],
);


annotate service.PurchaseRequisition with {
    Material @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'MaterialMaster',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: Material_material,
                    ValueListProperty: 'material',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'materialType',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'industrySector',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'baseUnit',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'materialGroup_materialGroup',
                },
            ],
        },
        Common.Label                   : '{i18n>Material}',
        Common.ValueListWithFixedValues: true,
    )
};

annotate service.PurchaseRequisition with {
    plant @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Plant',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: plant_plant,
                    ValueListProperty: 'plant',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'storageLocations_plant',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'plantName',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'city',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'country_code',
                },
            ],
        },
        Common.Label    : '{i18n>Plant}',
    )
};

annotate service.PurchaseRequisition with {
    PurchasingGroup @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PurchasingGroups',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: PurchasingGroup_purchasingGroup,
                    ValueListProperty: 'purchasingGroup',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'purchasingGroupDescription',
                },
            ],
        },
        Common.Label    : '{i18n>PurchasingGroup}',
    )
};

annotate service.PurchaseRequisition with {
    releaseStatus @Common.Label: 'Release Status'
};

annotate service.PurchaseRequisition with {
    requisitionDate @Common.Label: '{i18n>RequisitionDate}'
};

annotate service.MaterialMaster with {
    materialDescriptions @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'MaterialDescriptions',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: materialDescriptions,
                ValueListProperty: 'materialDescriptions',
            }, ],
        },
        Common.ValueListWithFixedValues: true,
        Common.Text                    : materialDescriptions_material,
        Common.Text.@UI.TextArrangement: #TextFirst,
    )
};

annotate service.PurchaseRequisition with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : requisitionDate,
        Descending: true,
    }],
    Visualizations: ['@UI.LineItem',
    ],
});

annotate service.PurchaseRequisition with @(UI: {
    // Object Page Layout
    HeaderInfo                    : {
        TypeName      : 'Purchase Requisition',
        TypeNamePlural: 'Purchase Requisitions',
        Title         : {
            $Type: 'UI.DataField',
            Value: purchaseRequisition
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: Material.materialDescriptions
        }
    },
    // Header Facets
    HeaderFacets                  : [{
        $Type : 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#HeaderDetails',
        Label : 'Header Details'
    }],
    // Field Group for Header
    FieldGroup #HeaderDetails     : {Data: [
        {
            $Type: 'UI.DataField',
            Value: purchaseRequisition,
            Label: 'Purchase Requisition'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.material,
            Label: 'Material'
        },
        {
            $Type: 'UI.DataField',
            Value: plant.plant,
            Label: 'Plant'
        },
        {
            $Type: 'UI.DataField',
            Value: releaseStatus,
            Label: 'Release Status'
        }
    ]},

    // General Information Section (EBAN fields)
    FieldGroup #GeneralInformation: {Data: [
        {
            $Type: 'UI.DataField',
            Value: purchaseRequisition,
            Label: 'Purchase Requisition'
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseReqnItem,
            Label: 'Item'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.material,
            Label: 'Material'
        },
        {
            $Type: 'UI.DataField',
            Value: plant.plant,
            Label: 'Plant'
        },
        {
            $Type: 'UI.DataField',
            Value: storageLocation,
            Label: 'Storage Location'
        },
        {
            $Type: 'UI.DataField',
            Value: quantity,
            Label: 'Quantity'
        },
        {
            $Type: 'UI.DataField',
            Value: baseUnit,
            Label: 'Base Unit'
        },
        {
            $Type: 'UI.DataField',
            Value: deliveryDate,
            Label: 'Delivery Date'
        },
        {
            $Type: 'UI.DataField',
            Value: requisitioner,
            Label: 'Requisitioner'
        },
        {
            $Type: 'UI.DataField',
            Value: releaseStatus,
            Label: 'Release Status'
        },
        {
            $Type: 'UI.DataField',
            Value: requisitionDate,
            Label: 'Requisition Date'
        },
        {
            $Type: 'UI.DataField',
            Value: createdByUser,
            Label: 'Created By'
        }
    ]},
    // Material Details Section (MARA, MAKT fields)
    FieldGroup #MaterialDetails   : {Data: [
        {
            $Type: 'UI.DataField',
            Value: Material.material,
            Label: 'Material'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.materialDescriptions.materialDescriptions,
            Label: 'Material Description'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.materialType,
            Label: 'Material Type'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.industrySector,
            Label: 'Industry Sector'
        },
        {
            $Type: 'UI.DataField',
            Value: Material.baseUnit,
            Label: 'Base Unit'
        }
    ]}
});

// LineItem for Account Assignments (EBKN)
annotate service.PurchaseRequisitionAccountAssignment with @(UI: {LineItem #AccountAssignments: [
    {
        $Type: 'UI.DataField',
        Value: purchaseRequisition,
        Label: 'Purchase Requisition'
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseReqnItem,
        Label: 'Item'
    },
    {
        $Type: 'UI.DataField',
        Value: acctAssignment,
        Label: 'Account Assignment'
    },
    {
        $Type: 'UI.DataField',
        Value: acctAssignmentCategory,
        Label: 'Category'
    },
    {
        $Type: 'UI.DataField',
        Value: glAccount,
        Label: 'G/L Account'
    },
    {
        $Type: 'UI.DataField',
        Value: costCenter,
        Label: 'Cost Center'
    },
    {
        $Type: 'UI.DataField',
        Value: order,
        Label: 'Order'
    }
]});

// LineItem for Supplier Info (EINA, LFA1)
annotate service.PurchasingInfoRecord with @(UI: {LineItem #SupplierInfo: [
    {
        $Type: 'UI.DataField',
        Value: purchasingInfoRecord,
        Label: 'Purchasing Info Record'
    },
    {
        $Type: 'UI.DataField',
        Value: supplier.supplier,
        Label: 'Supplier'
    },
    {
        $Type: 'UI.DataField',
        Value: supplier.supplierName,
        Label: 'Supplier Name'
    },
    {
        $Type: 'UI.DataField',
        Value: supplier.country,
        Label: 'Country'
    },
    {
        $Type: 'UI.DataField',
        Value: supplier.city,
        Label: 'City'
    }
]});


// Enable Create and Edit
annotate service.PurchaseRequisition with @(Capabilities: {
    Insertable: true,
    Updatable : true,
    Deletable : false
});
