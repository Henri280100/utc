using PurchaseOrderService as service from '../../srv/purchase-order-service';
using from '@sap/cds/common';

annotate service.PurchaseDocumentHeader with @(


    UI.FieldGroup #GeneratedGroup     : {
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
    UI.Facets                         : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Purchasing Document Item',
            ID : 'PurchasingDocumentItem',
            Target : 'purchasingDocumentItem/@UI.LineItem#PurchasingDocumentItem',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SupplierDetails}',
            ID    : 'i18nSupplierDetails',
            Target: '@UI.FieldGroup#i18nSupplierDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Pricing',
            ID : 'Pricing',
            Target : 'purchasingDocumentItem/@UI.LineItem#Pricing',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'PR Reference',
            ID : 'PRReference',
            Target : 'purchasingDocumentItem/@UI.LineItem#PRReference1',
        },

    ],
    UI.LineItem                       : [
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
    UI.SelectionFields                : [
        supplier_supplier,
        purchasingGroup_purchasingGroup,
        documentDate,
        purchaseOrderType,
    ],
    UI.FieldGroup #i18nSupplierDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: supplier.supplier,
                Label: '{i18n>Supplier}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplier.supplierName,
                Label: '{i18n>SupplierName}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplier.country_code,
            },
            {
                $Type: 'UI.DataField',
                Value: supplier.city,
                Label: '{i18n>City}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplier.street,
                Label: '{i18n>Street}',
            },
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
annotate service.PurchaseDocumentItem with @(
    UI.LineItem #PurchasingDocumentItem : [
        {
            $Type : 'UI.DataField',
            Value : purchaseOrder,
            Label : '{i18n>PurchaseOrder}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseOrderItem,
            Label : '{i18n>OrderItem}',
        },
        {
            $Type : 'UI.DataField',
            Value : quantity,
            Label : '{i18n>Quantity}',
        },
        {
            $Type : 'UI.DataField',
            Value : storageLocation,
            Label : '{i18n>StorageLocation}',
        },
        {
            $Type : 'UI.DataField',
            Value : baseUnit,
            Label : '{i18n>BaseUnit}',
        },
        {
            $Type : 'UI.DataField',
            Value : netPrice,
            Label : '{i18n>NetPrice}',
        },
    ],
    UI.LineItem #Pricing : [
        
    ],
    UI.LineItem #PRReference : [
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.purchaseRequisition,
            Label : '{i18n>PurchaseRequisition}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.purchaseReqnItem,
            Label : '{i18n>RequisitionItem}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.baseUnit,
            Label : '{i18n>BaseUnit}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.createdByUser,
            Label : '{i18n>CreatedByUser}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.deliveryDate,
            Label : '{i18n>DeliveryDate}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.PurchaseRequisitionType,
            Label : '{i18n>RequisitionType}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.quantity,
            Label : '{i18n>Quantity}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.releaseStatus,
            Label : '{i18n>ReleaseStatus}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.requisitionDate,
            Label : '{i18n>RequisitionDate}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.requisitioner,
            Label : '{i18n>Requisitioner}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequisition.storageLocation,
            Label : '{i18n>StorageLocation}',
        },
    ],
    UI.LineItem #PRReference1 : [
    ],
);

annotate service.PurchasingOrganizationData with {
    netPrice @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'PurchasingOrganizationData',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : netPrice,
                    ValueListProperty : 'netPrice',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
)};

