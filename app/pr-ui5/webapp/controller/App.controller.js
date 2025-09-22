sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sap.ui.prui5.controller.App", {
    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oLayoutModel = this.getOwnerComponent().getModel(); // holds /layout + /actionButtonsInfo

      // remember current route + args so we can re-nav with a new layout
      this.oRouter.attachRouteMatched(this.onRouteMatched, this);
    },

    onRouteMatched: function (oEvent) {
      this._currentRouteName = oEvent.getParameter("name");
      this._currentArgs = oEvent.getParameter("arguments") || {};
    },

    onFlexibleColumnLayoutStateChange: function (oEvent) {
      const bArrow = oEvent.getParameter("isNavigationArrow");
      const sLayout = oEvent.getParameter("layout");
      const oABI = oEvent.getParameter("actionButtonsInfo");

      // keep model in sync (used by your buttons’ visibility + handlers)
      this.oLayoutModel.setProperty("/layout", sLayout);
      this.oLayoutModel.setProperty("/actionButtonsInfo", oABI);

      // if user clicked an arrow, re-nav to the same route with the new layout
      if (bArrow && this._currentRouteName) {
        const mNav = Object.assign({}, this._currentArgs, { layout: sLayout });
        this.oRouter.navTo(this._currentRouteName, mNav, true); // replace hash
      }
    },
  });
});
