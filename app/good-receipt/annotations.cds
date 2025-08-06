using GoodReceiptService as service from '../../srv';
annotate service.MaterialDocument with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>MaterialDocNumber}',
                Value : materialDocNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>MaterialDocYear}',
                Value : materialDocYear,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>MaterialDocItem}',
                Value : materialDocItem,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Material}',
                Value : material_material,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Plant}',
                Value : plant_plant,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>StorageLocation}',
                Value : storageLocation,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Quantity}',
                Value : quantity,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>BaseUnit}',
                Value : baseUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>PurchaseOrder}',
                Value : purchaseOrderItem_purchaseOrder,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>PurchaseOrderItem}',
                Value : purchaseOrderItem_purchaseOrderItem,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>MovementType}',
                Value : movementType,
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
            Label : '{i18n>MaterialDetails}',
            ID : 'i18nMaterialDetails',
            Target : '@UI.FieldGroup#i18nMaterialDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>PoDetails}',
            ID : 'i18nPoDetails',
            Target : '@UI.FieldGroup#i18nPoDetails1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Plantstorage}',
            ID : 'PlantBranchs',
            Target : '@UI.FieldGroup#PlantBranchs',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : materialDocNumber,
            Label : '{i18n>MaterialDocument}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Material}',
            Value : material_material,
        },
        {
            $Type : 'UI.DataField',
            Value : material.materialDescriptions.materialDescriptions,
            Label : '{i18n>MaterialDescription1}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Plant}',
            Value : plant_plant,
        },
        {
            $Type : 'UI.DataField',
            Value : quantity,
            Label : '{i18n>Quantity}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseOrderItem_purchaseOrder,
            Label : '{i18n>PurchaseOrder}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDocYear,
            Label : '{i18n>MaterialDocYear}',
        },
    ],
    UI.FieldGroup #i18nMaterialDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : material.material,
                Label : '{i18n>Material}',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialDescriptions.materialDescriptions,
                Label : '{i18n>MaterialDescriptions}',
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
                Value : material.materialType,
                Label : '{i18n>MaterialType}',
            },
        ],
    },
    UI.FieldGroup #i18nPoDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem.purchaseOrderItem,
                Label : '{i18n>PurchaseOrderItem}',
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem.purchaseOrder,
                Label : '{i18n>PurchaseOrder}',
            },
        ],
    },
    UI.FieldGroup #PlantBranchs : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : plant.plant,
                Label : '{i18n>Plant}',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.plantName,
                Label : '{i18n>PlantName}',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.city,
                Label : '{i18n>City}',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.storageLocations.storageLocation,
                Label : '{i18n>StorageLocation}',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.storageLocations.storageLocationDescription,
                Label : '{i18n>StorageLocationDescription}',
            },
        ],
    },
    UI.SelectionFields : [
        material_material,
        plant_plant,
        purchaseOrderItem_purchaseOrder,
        movementType,
    ],
    UI.FieldGroup #i18nPoDetails1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem_purchaseOrder,
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem.purchaseOrderItem,
                Label : '{i18n>PurchaseOrderItem}',
            },
        ],
    },
);

annotate service.MaterialDocument with {
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

annotate service.MaterialDocument with {
    plant @(
        Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Plant',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : plant_plant,
                ValueListProperty : 'plant',
            },
        ],
    },
        Common.ValueListWithFixedValues : true,
        Common.Label : '{i18n>Plant}',
    )
};

annotate service.MaterialDocument with {
    purchaseOrderItem @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'PurchasingDocumentItem',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : purchaseOrderItem_purchaseOrder,
                    ValueListProperty : 'purchaseOrder',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'purchaseOrderItem',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'material_material',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'plant_plant',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'storageLocation',
                },
            ],
        },
        Common.Label : '{i18n>PurchaseOrder}',
    )
};

annotate service.MaterialMaster with {
    material @Common.Label : 'material/material'
};

annotate service.Plant with {
    plant @Common.Label : 'plant/plant'
};

annotate service.MaterialDocument with {
    movementType @Common.Label : '{i18n>MovementType}'
};

annotate service.MaterialDocument with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : materialDocYear,
        Descending: true,
    }],
    Visualizations: ['@UI.LineItem',
    ],
});
