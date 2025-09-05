sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/odata/v4/ODataModel"],
  function (UIComponent, ODataModel) {
    "use strict";

    return UIComponent.extend("sap.ui.prui5.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        const oModel = new ODataModel({
          serviceUrl: "/odata/v4/purchase-requisitions/",
          synchronizationMode: "None",
          operationMode: "Server",
          autoExpandSelect: true,
        });

        this.setModel(oModel, "PurchaseRequisition");
        console.log(oModel);
        this.getRouter().initialize();
      },
    });
  }
);
