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
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'fiscalYear',
            Value : fiscalYear,
        },
        {
            $Type : 'UI.DataField',
            Label : 'supplierInvoice',
            Value : supplierInvoice,
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
    ],
);

annotate service.SupplierInvoiceHeader with {
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

