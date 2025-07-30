sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'purchaseorder/test/integration/FirstJourney',
		'purchaseorder/test/integration/pages/PurchaseDocumentHeaderList',
		'purchaseorder/test/integration/pages/PurchaseDocumentHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseDocumentHeaderList, PurchaseDocumentHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('purchaseorder') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseDocumentHeaderList: PurchaseDocumentHeaderList,
					onThePurchaseDocumentHeaderObjectPage: PurchaseDocumentHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);