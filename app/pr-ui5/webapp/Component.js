sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/f/library"],
  function (UIComponent, JSONModel, fLibrary) {
    "use strict";

    return UIComponent.extend("sap.ui.prui5.Component", {
      metadata: { manifest: "json" },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        // Layout / FCL helper model shared app-wide
        this._oLayoutModel = new JSONModel({
          layout: fLibrary.LayoutType.OneColumn,
          actionButtonsInfo: {}, // will be filled by FCL helper in App.controller
        });
        this.setModel(this._oLayoutModel); // unnamed default model

        const oRouter = this.getRouter();
        oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        oRouter.attachRouteMatched(this._onRouteMatched, this);
        oRouter.initialize();
      },

      /** Keep /layout in model aligned with route arg or default */
      _onBeforeRouteMatched: function (oEvent) {
        const args =
          (oEvent.getParameters() && oEvent.getParameters().arguments) || {};
        const sLayout =
          args.layout ||
          this._oLayoutModel.getProperty("/layout") ||
          fLibrary.LayoutType.OneColumn;
        this._oLayoutModel.setProperty("/layout", sLayout);
      },

      /** Remember route + args for arrow nav updates */
      _onRouteMatched: function (oEvent) {
        this._currentRouteName = oEvent.getParameter("name");
        this._currentArgs = oEvent.getParameter("arguments") || {};
      },

      // Small helpers if you need them elsewhere
      getLayoutModel: function () {
        return this._oLayoutModel;
      },
      getCurrentRouteInfo: function () {
        return { name: this._currentRouteName, args: this._currentArgs };
      },
    });
  }
);
