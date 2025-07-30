using PurchaseOrderService as service from '../../srv/purchase-order-service';
using from '@sap/cds/common';

annotate service.PurchaseDocumentHeader with @(
    UI.FieldGroup #PurchaseOrderItems: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchasingDocumentItem.purchaseOrderItem,
                Label : 'purchaseOrderItem',
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrder,
                Label : 'purchaseOrder',
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingDocumentItem.material.material,
                Label : 'material',
            },
        ],
    },

    UI.FieldGroup #GeneratedGroup    : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'purchaseOrder',
                Value: purchaseOrder,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>DocumentCategory}',
                Value: documentCategory,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>OrderType}',
                Value: purchaseOrderType,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>PurchaseOrder}',
                Value: purchaseOrder,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Supplier}',
                Value: supplier_supplier,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Group}',
                Value: purchasingGroup_purchasingGroup,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>DocumentDate}',
                Value: documentDate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Currency}',
                Value: currency_code,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>PaymentTerms}',
                Value: paymentTerms,
            },
        ],
    },
    UI.Facets                        : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Purchasing Document Item',
            Target: '@UI.FieldGroup#PurchaseOrderItems',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SupplierDetails}',
            ID : 'i18nSupplierDetails',
            Target : '@UI.FieldGroup#i18nSupplierDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>PrReference}',
            ID : 'PRReference',
            Target : '@UI.FieldGroup#PRReference',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Pricing}',
            ID : 'Pricing',
            Target : '@UI.FieldGroup#Pricing',
        },

    ],
    UI.LineItem                      : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>PurchaseOrder}',
            Value: purchaseOrder,
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_supplier,
            Label: '{i18n>Supplier}',
        },
        {
            $Type: 'UI.DataField',
            Value: supplier.supplierName,
            Label: '{i18n>SupplierName}',
        },
        {
            $Type: 'UI.DataField',
            Value: documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: currency_code,
            Label: '{i18n>Currency}',
        },
    ],
    UI.SelectionFields               : [
        supplier_supplier,
        purchasingGroup_purchasingGroup,
        documentDate,
        purchaseOrderType,
    ],
    UI.FieldGroup #i18nSupplierDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
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
                Value : supplier.country_code,
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.city,
                Label : '{i18n>City}',
            },
            {
                $Type : 'UI.DataField',
                Value : supplier.street,
                Label : '{i18n>Street}',
            },
        ],
    },
    UI.FieldGroup #PRReference : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #Pricing : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
);



annotate service.PurchaseDocumentHeader with {
    supplier @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VendorMaster',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: supplier_supplier,
                    ValueListProperty: 'supplier',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'supplierName',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'country_code',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'city',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'street',
                },
            ],
        },
        Common.Label    : '{i18n>Supplier}',
    )
};

annotate service.PurchaseDocumentHeader with {
    purchasingGroup @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PurchasingGroups',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: purchasingGroup_purchasingGroup,
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

annotate service.Currencies with {
    code @(
        Common.Text                    : name,
        Common.Text.@UI.TextArrangement: #TextFirst,
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Currencies',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: code,
                ValueListProperty: 'code',
            }, ],
        },
        Common.ValueListWithFixedValues: true,
    )
};

annotate service.PurchaseDocumentHeader with {
    documentDate @Common.Label: '{i18n>DocumentDate}'
};

annotate service.PurchaseDocumentHeader with {
    purchaseOrderType @Common.Label: '{i18n>PurchaseOrderType}'
};

annotate service.PurchaseDocumentHeader with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : documentDate,
        Descending: true,
    }],
    Visualizations: ['@UI.LineItem',
    ],
});
