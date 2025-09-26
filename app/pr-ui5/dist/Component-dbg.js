sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/f/library"], function (UIComponent, JSONModel, fLibrary) {
  "use strict";

  class Component extends UIComponent {
    static metadata = {
      manifest: "json"
    };

    /** default/unnamed model → {/layout}, {/actionButtonsInfo} */

    _currentArgs = {};

    // keep bound refs so we can detach later

    init() {
      super.init();
      this._oLayoutModel = new JSONModel({
        layout: fLibrary.LayoutType.OneColumn,
        actionButtonsInfo: {}
      });
      this.setModel(this._oLayoutModel); // unnamed default model

      const oRouter = this.getRouter();
      this._onBeforeRouteMatchedBound = this._onBeforeRouteMatched.bind(this);
      this._onRouteMatchedBound = this._onRouteMatched.bind(this);
      oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatchedBound);
      oRouter.attachRouteMatched(this._onRouteMatchedBound);
      oRouter.initialize();
    }

    /** Keep /layout aligned with route arg or fallback */
    _onBeforeRouteMatched(oEvent) {
      const args = oEvent.getParameter("arguments") || {};
      const current = this._oLayoutModel.getProperty("/layout");
      const next = args.layout || current || fLibrary.LayoutType.OneColumn;
      if (current !== next) {
        this._oLayoutModel.setProperty("/layout", next);
      }
    }

    /** Remember route + args for arrow navigation updates */
    _onRouteMatched(oEvent) {
      this._currentRouteName = oEvent.getParameter("name");
      this._currentArgs = oEvent.getParameter("arguments") || {};
    }

    /** Small helpers (optional) */
    getLayoutModel() {
      return this._oLayoutModel;
    }
    getCurrentRouteInfo() {
      return {
        name: this._currentRouteName,
        args: this._currentArgs
      };
    }
    destroy() {
      const oRouter = this.getRouter();
      if (this._onBeforeRouteMatchedBound) {
        oRouter.detachBeforeRouteMatched(this._onBeforeRouteMatchedBound, this);
      }
      if (this._onRouteMatchedBound) {
        oRouter.detachRouteMatched(this._onRouteMatchedBound, this);
      }
      super.destroy();
    }
  }
  return Component;
});
//# sourceMappingURL=Component-dbg.js.map
