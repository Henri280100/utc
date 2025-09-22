sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/f/library",
  ],
  function (Controller, FlexibleColumnLayoutSemanticHelper, fLibrary) {
    "use strict";

    return Controller.extend("sap.ui.prui5.controller.App", {
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oLayoutModel = this.getOwnerComponent().getModel(); // the JSONModel above

        this._oFCL = this.byId("idFlexibleColumnLayout");
        const settings = {
          defaultTwoColumnLayoutType: fLibrary.LayoutType.TwoColumnsMidExpanded,
          defaultThreeColumnLayoutType:
            fLibrary.LayoutType.ThreeColumnsMidExpanded,
        };
        this._fclHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(
          this._oFCL,
          settings
        );

        // compute once at startup
        this._updateUIState();

        // react to FCL state changes
        this._oFCL.attachStateChange(
          this.onFlexibleColumnLayoutStateChange,
          this
        );

        // keep current route/params for arrow nav
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);
      },

      _updateUIState: function () {
        const uiState = this._fclHelper.getCurrentUIState();
        this.oLayoutModel.setProperty("/layout", uiState.layout);
        this.oLayoutModel.setProperty(
          "/actionButtonsInfo",
          uiState.actionButtonsInfo || {}
        );
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
          const mNav = Object.assign({}, this._currentArgs, {
            layout: sLayout,
          });
          this.oRouter.navTo(this._currentRouteName, mNav, true); // replace hash
        }
      },
    });
  }
);
