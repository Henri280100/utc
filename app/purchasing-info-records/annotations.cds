using PurchasingInfoRecordsService as service from '../../srv/purchasing-info-records-service';
annotate service.PurchasingInfoRecord with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'purchasingInfoRecord',
                Value : purchasingInfoRecord,
            },
            {
                $Type : 'UI.DataField',
                Label : 'material_material',
                Value : material_material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'supplier_supplier',
                Value : supplier_supplier,
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
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'purchasingInfoRecord',
            Value : purchasingInfoRecord,
        },
        {
            $Type : 'UI.DataField',
            Label : 'material_material',
            Value : material_material,
        },
        {
            $Type : 'UI.DataField',
            Label : 'supplier_supplier',
            Value : supplier_supplier,
        },
    ],
);

annotate service.PurchasingInfoRecord with {
    material @Common.ValueList : {
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
    }
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

