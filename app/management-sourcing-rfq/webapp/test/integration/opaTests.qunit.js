sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'managementsourcingrfq/test/integration/FirstJourney',
		'managementsourcingrfq/test/integration/pages/PurchasingDocumentHeaderList',
		'managementsourcingrfq/test/integration/pages/PurchasingDocumentHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchasingDocumentHeaderList, PurchasingDocumentHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('managementsourcingrfq') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchasingDocumentHeaderList: PurchasingDocumentHeaderList,
					onThePurchasingDocumentHeaderObjectPage: PurchasingDocumentHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);