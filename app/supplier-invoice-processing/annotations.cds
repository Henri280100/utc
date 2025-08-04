using SupplierProcessingService as service from '../../srv/supplier-processing-service';
annotate service.SupplierInvoiceHeader with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'supplierInvoice',
                Value : supplierInvoice,
            },
            {
                $Type : 'UI.DataField',
                Label : 'fiscalYear',
                Value : fiscalYear,
            },
            {
                $Type : 'UI.DataField',
                Label : 'supplier_supplier',
                Value : supplier_supplier,
            },
            {
                $Type : 'UI.DataField',
                Label : 'documentDate',
                Value : documentDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'grossAmount',
                Value : grossAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'currency_code',
                Value : currency_code,
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
            Label : '{i18n>Accounting}',
            ID : 'i18nAccounting',
            Target : '@UI.FieldGroup#i18nAccounting',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>SupplierInvoice}',
            Value : supplierInvoice,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Supplier}',
            Value : supplier_supplier,
        },
        {
            $Type : 'UI.DataField',
            Value : supplier.supplierName,
            Label : '{i18n>SupplierName}',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>DocumentDate}',
            Value : documentDate,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>GrossAmount}',
            Value : grossAmount,
        },
    ],
    UI.SelectionFields : [
        supplier_supplier,
        supplier.supplierName,
        documentDate,
        grossAmount,
    ],
    UI.FieldGroup #i18nAccounting : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
);

annotate service.SupplierInvoiceHeader with {
    supplier @(
        Common.ValueList : {
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
        },
        Common.Label : '{i18n>Supplier}',
    )
};

annotate service.VendorMaster with {
    supplierName @Common.Label : '{i18n>SupplierName}'
};

annotate service.SupplierInvoiceHeader with {
    documentDate @Common.Label : '{i18n>DocumentDate}'
};

annotate service.SupplierInvoiceHeader with {
    grossAmount @Common.Label : '{i18n>GrossAmount}'
};

annotate service.SupplierInvoiceHeader with @(UI.PresentationVariant: {
    SortOrder     : [{
        Property  : documentDate,
        Descending: true,
    }],
    Visualizations: ['@UI.LineItem',
    ],
});
annotate service.SupplierInvoiceItem with @(
    UI.LineItem #i18nItems : [
        {
            $Type : 'UI.DataField',
            Value : supplierInvoiceItem,
            Label : 'supplierInvoiceItem',
        },
    ]
);

