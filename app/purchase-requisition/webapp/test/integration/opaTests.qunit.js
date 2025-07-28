sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'purchaserequisition/test/integration/FirstJourney',
		'purchaserequisition/test/integration/pages/PurchaseRequisitionList',
		'purchaserequisition/test/integration/pages/PurchaseRequisitionObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseRequisitionList, PurchaseRequisitionObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('purchaserequisition') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseRequisitionList: PurchaseRequisitionList,
					onThePurchaseRequisitionObjectPage: PurchaseRequisitionObjectPage
                }
            },
            opaJourney.run
        );
    }
);