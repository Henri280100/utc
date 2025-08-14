using SourcingRFQService as service from '../../srv/management-service/sourcing-rfq-service';
annotate service.PurchasingDocumentHeader with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : purchaseOrder,
            Label : '{i18n>RfqNumber}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseOrderType,
            Label : '{i18n>OrderType}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchasingDocumentItem.plant_plant,
            Label : '{i18n>Plant}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchasingDocumentItem.quantity,
            Label : '{i18n>Quantity}',
        },
        {
            $Type : 'UI.DataField',
            Value : documentDate,
            Label : '{i18n>DocumentDate}',
        },
        {
            $Type : 'UI.DataField',
            Value : documentCategory,
            Label : '{i18n>DocCategory}',
        },
        {
            $Type : 'UI.DataField',
            Value : paymentTerms,
            Label : '{i18n>PaymentTerms}',
        },
    ],
    UI.SelectionFields : [
        documentDate,
        supplier_supplier,
        purchasingDocumentItem.plant_plant,
    ],
);

annotate service.PurchasingDocumentHeader with {
    supplier @Common.Label : '{i18n>Supplier}'
};

annotate service.PurchasingDocumentItem with {
    plant @Common.Label : '{i18n>Plant}'
};

annotate service.PurchasingDocumentHeader with {
    documentDate @Common.Label : '{i18n>DocDate}'
};

