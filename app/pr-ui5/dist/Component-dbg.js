sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/f/library"], function (UIComponent, JSONModel, fLibrary) {
  "use strict";

  /** 
   * @namespace sap.ui.prui5
   */
  const Component = UIComponent.extend("sap.ui.prui5.Component", {
    constructor: function constructor() {
      UIComponent.prototype.constructor.apply(this, arguments);
      this._currentArgs = {};
    },
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json"
    },
    init: function _init() {
      UIComponent.prototype.init.call(this);
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
    },
    /** Keep /layout aligned with route arg or fallback */_onBeforeRouteMatched: function _onBeforeRouteMatched(oEvent) {
      const args = oEvent.getParameter("arguments") || {};
      const current = this._oLayoutModel.getProperty("/layout");
      const next = args.layout || current || fLibrary.LayoutType.OneColumn;
      if (current !== next) {
        this._oLayoutModel.setProperty("/layout", next);
      }
    },
    /** Remember route + args for arrow navigation updates */_onRouteMatched: function _onRouteMatched(oEvent) {
      this._currentRouteName = oEvent.getParameter("name");
      this._currentArgs = oEvent.getParameter("arguments") || {};
    },
    /** Small helpers (optional) */getLayoutModel: function _getLayoutModel() {
      return this._oLayoutModel;
    },
    getCurrentRouteInfo: function _getCurrentRouteInfo() {
      return {
        name: this._currentRouteName,
        args: this._currentArgs
      };
    },
    destroy: function _destroy() {
      const oRouter = this.getRouter();
      if (this._onBeforeRouteMatchedBound) {
        oRouter.detachBeforeRouteMatched(this._onBeforeRouteMatchedBound, this);
      }
      if (this._onRouteMatchedBound) {
        oRouter.detachRouteMatched(this._onRouteMatchedBound, this);
      }
      UIComponent.prototype.destroy.call(this);
    }
  });
  return Component;
});
//# sourceMappingURL=Component-dbg.js.map
