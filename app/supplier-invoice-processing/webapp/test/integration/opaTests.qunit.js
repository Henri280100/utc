sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'supplierinvoiceprocessing/test/integration/FirstJourney',
		'supplierinvoiceprocessing/test/integration/pages/SupplierInvoiceHeaderList',
		'supplierinvoiceprocessing/test/integration/pages/SupplierInvoiceHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, SupplierInvoiceHeaderList, SupplierInvoiceHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('supplierinvoiceprocessing') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSupplierInvoiceHeaderList: SupplierInvoiceHeaderList,
					onTheSupplierInvoiceHeaderObjectPage: SupplierInvoiceHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);