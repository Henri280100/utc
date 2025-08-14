using SupplierProcessingService as service from '../../srv';

annotate service.SupplierInvoiceHeader with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>SupplierInvoice}',
                Value: supplierInvoice,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>FiscalYear}',
                Value: fiscalYear,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Supplier}',
                Value: supplier_supplier,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>DocumentDate}',
                Value: documentDate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>GrossAmount}',
                Value: grossAmount,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Currency}',
                Value: currency_code,
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
            Label : '{i18n>Items}',
            ID    : 'i18nItems',
            Target: '@UI.FieldGroup#i18nItems',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Accounting}',
            ID    : 'i18nAccounting',
            Target: '@UI.FieldGroup#i18nAccounting',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>PoDetails}',
            ID    : 'i18nPoDetails',
            Target: 'supplierInvoiceItem/@UI.LineItem#i18nPoDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>GrDetails}',
            ID    : 'i18nGrDetails',
            Target: 'supplierInvoiceItem/@UI.LineItem#i18nGrDetails',
        },
    ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>SupplierInvoice}',
            Value: supplierInvoice,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Supplier}',
            Value: supplier_supplier,
        },
        {
            $Type: 'UI.DataField',
            Value: supplier.supplierName,
            Label: '{i18n>SupplierName}',
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>DocumentDate}',
            Value: documentDate,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>GrossAmount}',
            Value: grossAmount,
        },
    ],
    UI.SelectionFields           : [
        supplier_supplier,
        supplier.supplierName,
        documentDate,
        grossAmount,
    ],
    UI.FieldGroup #i18nAccounting: {
        $Type: 'UI.FieldGroupType',
        Data : [

        ],
    },
    UI.FieldGroup #i18nItems     : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.amount,
                Label: '{i18n>Amount}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.baseUnit,
                Label: '{i18n>BaseUnit}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.material_material,
                Label: '{i18n>Material}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.purchaseOrder_purchaseOrder,
                Label: '{i18n>PurchaseOrder}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.purchaseOrderItem_purchaseOrderItem,
                Label: '{i18n>PurchaseOrderItem}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.quantity,
                Label: '{i18n>Quantity}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.supplierInvoice,
                Label: '{i18n>SupplierInvoice}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierInvoiceItem.supplierInvoiceItem,
                Label: '{i18n>SupplierInvoiceItem1}',
            },
        ],
    },
    UI.UpdateHidden              : true
);

annotate service.SupplierInvoiceHeader with {
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

annotate service.VendorMaster with {
    supplierName @Common.Label: '{i18n>SupplierName}'
};

annotate service.SupplierInvoiceHeader with {
    documentDate @Common.Label: '{i18n>DocumentDate}'
};

annotate service.SupplierInvoiceHeader with {
    grossAmount @Common.Label: '{i18n>GrossAmount}'
};

annotate service.SupplierInvoiceHeader with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : documentDate,
        Descending: true,
    }],
    GroupBy       : [grossAmount],
    Visualizations: ['@UI.LineItem',
    ],
});

annotate service.SupplierInvoiceItem with @(
    UI.LineItem #i18nItems    : [{
        $Type: 'UI.DataField',
        Value: supplierInvoiceItem,
        Label: 'supplierInvoiceItem',
    }, ],
    UI.LineItem #i18nPoDetails: [
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.documentCategory,
            Label: '{i18n>DocumentCategory}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.documentDate,
            Label: '{i18n>DocumentDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.paymentTerms,
            Label: '{i18n>PaymentTerms}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.purchaseOrder,
            Label: '{i18n>PurchaseOrder}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.purchaseOrderType,
            Label: '{i18n>PurchaseOrderType}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.supplier_supplier,
            Label: '{i18n>Supplier}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrder.currency_code,
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.baseUnit,
            Label: '{i18n>BaseUnit}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.netPrice,
            Label: '{i18n>NetPrice}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.purchaseOrder,
            Label: '{i18n>PurchaseOrder}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.purchaseOrderItem,
            Label: '{i18n>PurchaseOrderItem}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.quantity,
            Label: '{i18n>Quantity}',
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderItem.storageLocation,
            Label: '{i18n>StorageLocation}',
        },
    ],
    UI.LineItem #i18nGrDetails: [
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.materialDocItem,
            Label : '{i18n>DocItem}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.materialDocNumber,
            Label : '{i18n>DocNo}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.materialDocYear,
            Label : '{i18n>DocYear}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.movementType,
            Label : '{i18n>MovementType}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.baseUnit,
            Label : '{i18n>BaseUnit}',
        },
        {
            $Type : 'UI.DataField',
            Value : materialDoc.materialMaster.quantity,
            Label : '{i18n>Quantity}',
        },
    ],
);

annotate service.SupplierInvoiceHeader with {
    supplierInvoice @readonly;
    fiscalYear      @readonly;
};
