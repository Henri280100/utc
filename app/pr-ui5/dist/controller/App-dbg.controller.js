sap.ui.define(["sap/ui/core/mvc/Controller", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/library"], function (Controller, FlexibleColumnLayoutSemanticHelper, fLibrary) {
  "use strict";

  const AppController = Controller.extend("webapp.controller.AppController", {
    constructor: function constructor() {
      Controller.prototype.constructor.apply(this, arguments);
      this._currentRouteName = "";
      this._currentArgs = {};
    },
    onInit: function _onInit() {
      // Router & layout model from Component
      const comp = this.getOwnerComponent();
      if (!comp) throw new Error("No owner component");
      this.oRouter = comp.getRouter();
      this.oLayoutModel = comp.getModel(); // default model provided in Component

      // FCL control + helper
      this._oFCL = this.byId("idFlexibleColumnLayout");
      const settings = {
        defaultTwoColumnLayoutType: fLibrary.LayoutType.TwoColumnsMidExpanded,
        defaultThreeColumnLayoutType: fLibrary.LayoutType.ThreeColumnsMidExpanded
      };
      this._fclHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(this._oFCL, settings);

      // Initial UI state
      this._updateUIState();

      // Attach handlers (keep references to detach later)
      this._onFclStateChangeBound = this.onFlexibleColumnLayoutStateChange.bind(this);
      this._oFCL.attachStateChange(this._onFclStateChangeBound);
      this._onRouteMatchedBound = this.onRouteMatched.bind(this);
      this.oRouter.attachRouteMatched(this._onRouteMatchedBound);
    },
    /** Compute & write current UI state into the shared layout model */_updateUIState: function _updateUIState() {
      const uiState = this._fclHelper.getCurrentUIState();
      this.oLayoutModel.setProperty("/layout", uiState.layout);
      this.oLayoutModel.setProperty("/actionButtonsInfo", uiState.actionButtonsInfo);
    },
    /** Remember route + args for arrow navigation */onRouteMatched: function _onRouteMatched(oEvent) {
      this._currentRouteName = oEvent.getParameter("name") || "";
      this._currentArgs = oEvent.getParameter("arguments") || {};
    },
    /** When user clicks FCL arrows, keep model in sync and re-nav with new layout */onFlexibleColumnLayoutStateChange: function _onFlexibleColumnLayoutStateChange(oEvent) {
      const bArrow = oEvent.getParameter("isNavigationArrow");
      const sLayout = oEvent.getParameter("layout");
      const oABI = oEvent.getParameter("actionButtonsInfo");

      // keep model in sync (used by buttons’ visibility + handlers)
      this.oLayoutModel.setProperty("/layout", sLayout);
      this.oLayoutModel.setProperty("/actionButtonsInfo", oABI);

      // if user clicked an arrow, re-nav to the same route with the new layout
      if (bArrow && this._currentRouteName) {
        const mNav = {
          ...this._currentArgs,
          layout: sLayout
        };
        this.oRouter.navTo(this._currentRouteName, mNav, true); // replace hash
      }
    },
    /** Clean up */onExit: function _onExit() {
      if (this._oFCL && this._onFclStateChangeBound) {
        this._oFCL.detachStateChange(this._onFclStateChangeBound);
      }
      if (this.oRouter && this._onRouteMatchedBound) {
        this.oRouter.detachRouteMatched(this._onRouteMatchedBound, this);
      }
    }
  });
  return AppController;
});
//# sourceMappingURL=App-dbg.controller.js.map
