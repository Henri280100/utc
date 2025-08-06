using PurchasingInfoRecordsService as service from '../../srv';
annotate service.PurchasingInfoRecord with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>PurchasingInfoRecord}',
                Value : purchasingInfoRecord,
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingOrgData.purchasingInfoRecord,
                Label : '{i18n>PurchasingInfoRecord}',
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingOrgData.purchasingOrganization,
                Label : '{i18n>PurchasingOrg1}',
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Material}',
                Value : material_material,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Supplier}',
                Value : supplier_supplier,
            },
            {
                $Type : 'UI.DataField',
                Value : material.baseUnit,
                Label : '{i18n>BaseUnit}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.creationDate,
                Label : '{i18n>CreationDate}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.industrySector,
                Label : '{i18n>IndustrySector}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.material,
                Label : '{i18n>Material}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialType,
                Label : '{i18n>MaterialType}',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.supplier,
                Label : '{i18n>Supplier}',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.supplierName,
                Label : '{i18n>SupplierName}',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.city,
                Label : '{i18n>City}',
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Pricing}',
            ID : 'Pricing',
            Target : '@UI.FieldGroup#Pricing',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Conditions}',
            ID : 'i18nConditions',
            Target : '@UI.FieldGroup#i18nConditions1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>MaterialDetails}',
            ID : 'i18nMaterialDetails',
            Target : '@UI.FieldGroup#i18nMaterialDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SupplierDetails}',
            ID : 'i18nSupplierDetails',
            Target : '@UI.FieldGroup#i18nSupplierDetails',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>PurchasingInfoRecord}',
            Value : purchasingInfoRecord,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Material}',
            Value : material_material,
        },
        {
            $Type : 'UI.DataField',
            Value : material.materialDescriptions.materialDescriptions,
            Label : '{i18n>MaterialDescriptions}',
        },
        {
            $Type : 'UI.DataField',
            Value : supplier.supplierName,
            Label : '{i18n>SupplierName}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Supplier}',
            Value : supplier_supplier,
        },
        {
            $Type : 'UI.DataField',
            Value : purchasingOrgData.netPrice,
            Label : '{i18n>NetPrice}',
        },
        
    ],
    UI.SelectionFields : [
        material_material,
        supplier.supplier,
        purchasingOrgData.purchasingOrganization,
    ],
    UI.FieldGroup #Pricing : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchasingOrgData.netPrice,
                Label : '{i18n>NetPrice}',
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingOrgData.priceUnit,
                Label : '{i18n>PriceUnit}',
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingOrgData.purchasingOrganization,
            },
        ],
    },
    
    UI.FieldGroup #i18nConditions1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.application,
                Label : '{i18n>Application}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.material_material,
                Label : '{i18n>Material}',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.infoRecords.supplier_supplier,
                Label : '{i18n>Supplier}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.conditionType,
                Label : '{i18n>ConditionType}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.plant_plant,
                Label : '{i18n>Plant}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.purchaseContract,
                Label : '{i18n>PurchaseContract}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.infoRecords.purchasingOrganization,
                Label : '{i18n>Organization}',
            },
        ],
    },
    UI.FieldGroup #i18nMaterialDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : material.material,
            },
            {
                $Type : 'UI.DataField',
                Value : material.industrySector,
                Label : 'industrySector',
            },
            {
                $Type : 'UI.DataField',
                Value : material.creationDate,
                Label : 'creationDate',
            },
            {
                $Type : 'UI.DataField',
                Value : material.baseUnit,
                Label : 'baseUnit',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialType,
                Label : 'materialType',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialDescriptions.materialDescriptions,
                Label : 'materialDescriptions',
            },
        ],
    },
    UI.FieldGroup #i18nSupplierDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : supplier.city,
                Label : 'city',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.street,
                Label : 'street',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.country_code,
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.supplier,
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.supplierName,
                Label : 'supplierName',
            },
        ],
    },
);

annotate service.PurchasingInfoRecord with {
    material @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaterialMaster',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : material_material,
                    ValueListProperty : 'material',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'materialType',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'industrySector',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'baseUnit',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'materialGroup_materialGroup',
                },
            ],
        },
        Common.Label : '{i18n>Material}',
    )
};

annotate service.PurchasingInfoRecord with {
    supplier @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'VendorMaster',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : supplier_supplier,
                ValueListProperty : 'supplier',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'supplierName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'country_code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'city',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'street',
            },
        ],
    }
};

annotate service.MaterialMaster with {
    material @Common.Label : 'material/material'
};

annotate service.VendorMaster with {
    supplier @Common.Label : '{i18n>Supplier}'
};

annotate service.PurchasingOrganizationData with {
    purchasingOrganization @Common.Label : '{i18n>PurchasingOrgData}'
};

annotate service.PurchasingInfoRecord with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : purchasingInfoRecord,
        Descending : false,
    }],

    Visualizations: ['@UI.LineItem',
    ],
});
annotate service.PurchasingOrganizationData with @(
    UI.LineItem #i18nCoditions : [
    ],
    UI.LineItem #i18nMaterialdetails : [
        
    ],
    UI.LineItem #i18nSupplierDetails : [
    ],
);

