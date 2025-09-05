sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast"], (Controller, MessageToast) => {
  "use strict";

  return Controller.extend("sap.ui.prui5.controller.Detail", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("detail")
        .attachPatternMatched(this._onObjectMatched, this);
      console.log(oRouter);
    },

    _onObjectMatched: function (oEvent) {
      const oModel = this.getView().getModel("PurchaseRequisition");

      // Create a list binding for the entity set
      const oListBinding = oModel.bindList(
        "/PurchasingInfoRecord",
        undefined,
        undefined,
        undefined,
        {
          $expand: "supplier($select=supplierName,country_code)",
        }
      );

      // Request contexts (data rows)
      oListBinding
        .requestContexts()
        .then((aContexts) => {
          const aItems = aContexts.map((ctx) => ctx.getObject());
          console.log("Fetched items manually:", aItems);

          if (aItems.length === 0) {
            sap.m.MessageToast.show("No supplier data available");
          }

          // You can now use aItems to populate other controls or process further
        })
        .catch((err) => {
          console.error("Error fetching items:", err);
        });
    },

    onTableDataReceived: function (oEvent) {
      const oTable = this.byId("idPurchasingInfoRecordsTable");
      const oBinding = oTable.getBinding("items");

      if (oBinding) {
        const iLength = oTable.getGrowingThreshold?.() || 100; // fallback to 100
        const aContexts = oBinding.getContexts(0, iLength);

        const aItems = aContexts.map((ctx) => ctx.getObject());

        console.log("Table Data from binding:", aItems);

        if (aItems.length === 0) {
          sap.m.MessageToast.show("No supplier data available");
        }
      } else {
        console.warn("No binding found for table items.");
      }
    },

    onEditToggleButtonPress: function () {
      var oObjectPage = this.getView().byId("idObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
    },

    onApproveToggleButtonPress: function () {
       MessageToast.show("Oh no... This function not implement yet!")
    },

    onRejectToggleButtonPress: function () {
      MessageToast.show("Oh no... This function not implement yet!")
    },

    // 🔽 Manually fetch data from the model
    //   oModel.read("/PurchaseRequisition/PurchasingInfoRecord", {
    //     urlParameters: {
    //       $expand: "supplier($select=supplierName,country_code)",
    //     },
    //     success: function (oData) {
    //       console.log("Manual fetch success:", oData.results);
    //       // You can now use oData.results to do further processing
    //     },
    //     error: function (oError) {
    //       console.error("Manual fetch error:", oError);
    //     },
    //   });
    // },
  });
});
