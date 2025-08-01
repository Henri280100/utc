sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'goodreceipt/test/integration/FirstJourney',
		'goodreceipt/test/integration/pages/MaterialDocumentList',
		'goodreceipt/test/integration/pages/MaterialDocumentObjectPage'
    ],
    function(JourneyRunner, opaJourney, MaterialDocumentList, MaterialDocumentObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('goodreceipt') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMaterialDocumentList: MaterialDocumentList,
					onTheMaterialDocumentObjectPage: MaterialDocumentObjectPage
                }
            },
            opaJourney.run
        );
    }
);