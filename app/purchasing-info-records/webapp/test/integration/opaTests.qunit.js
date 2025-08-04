sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'purchasinginforecords/test/integration/FirstJourney',
		'purchasinginforecords/test/integration/pages/PurchasingInfoRecordList',
		'purchasinginforecords/test/integration/pages/PurchasingInfoRecordObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchasingInfoRecordList, PurchasingInfoRecordObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('purchasinginforecords') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchasingInfoRecordList: PurchasingInfoRecordList,
					onThePurchasingInfoRecordObjectPage: PurchasingInfoRecordObjectPage
                }
            },
            opaJourney.run
        );
    }
);