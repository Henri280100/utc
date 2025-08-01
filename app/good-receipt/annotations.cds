using GoodReceiptService as service from '../../srv/good-receipt-service';
annotate service.MaterialDocument with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'materialDocNumber',
                Value : materialDocNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'materialDocYear',
                Value : materialDocYear,
            },
            {
                $Type : 'UI.DataField',
                Label : 'materialDocItem',
                Value : materialDocItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'material_material',
                Value : material_material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'plant_plant',
                Value : plant_plant,
            },
            {
                $Type : 'UI.DataField',
                Label : 'storageLocation',
                Value : storageLocation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'quantity',
                Value : quantity,
            },
            {
                $Type : 'UI.DataField',
                Label : 'baseUnit',
                Value : baseUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : 'purchaseOrderItem_purchaseOrder',
                Value : purchaseOrderItem_purchaseOrder,
            },
            {
                $Type : 'UI.DataField',
                Label : 'purchaseOrderItem_purchaseOrderItem',
                Value : purchaseOrderItem_purchaseOrderItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'movementType',
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
            Target : '@UI.FieldGroup#i18nPoDetails',
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
    ],
    UI.FieldGroup #i18nMaterialDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : material.material,
                Label : 'material',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialDescriptions.materialDescriptions,
                Label : 'materialDescriptions',
            },
            {
                $Type : 'UI.DataField',
                Value : material.baseUnit,
                Label : 'baseUnit',
            },
            {
                $Type : 'UI.DataField',
                Value : material.creationDate,
                Label : 'creationDate',
            },
            {
                $Type : 'UI.DataField',
                Value : material.industrySector,
                Label : 'industrySector',
            },
            {
                $Type : 'UI.DataField',
                Value : material.materialType,
                Label : 'materialType',
            },
        ],
    },
    UI.FieldGroup #i18nPoDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem.purchaseOrderItem,
                Label : 'purchaseOrderItem',
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrderItem.purchaseOrder,
                Label : 'purchaseOrder',
            },
        ],
    },
    UI.FieldGroup #PlantBranchs : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : plant.plant,
                Label : 'plant',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.plantName,
                Label : 'plantName',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.city,
                Label : 'city',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.storageLocations.storageLocation,
                Label : 'storageLocation',
            },
            {
                $Type : 'UI.DataField',
                Value : plant.storageLocations.storageLocationDescription,
                Label : 'storageLocationDescription',
            },
        ],
    },
);

annotate service.MaterialDocument with {
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

annotate service.MaterialDocument with {
    plant @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Plant',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : plant_plant,
                ValueListProperty : 'plant',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'storageLocations_plant',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'plantName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'city',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'country_code',
            },
        ],
    }
};

annotate service.MaterialDocument with {
    purchaseOrderItem @Common.ValueList : {
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
    }
};

