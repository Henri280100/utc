sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/f/library", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Controller, MessageBox, fLibrary, Filter, FilterOperator, Sorter) {
  "use strict";

  const ListController = Controller.extend("webapp.controller.ListController", {
    constructor: function constructor() {
      Controller.prototype.constructor.apply(this, arguments);
      this._bDescendingSort = false;
    },
    onInit: function _onInit() {
      // View & Router
      const view = this.getView();
      const comp = this.getOwnerComponent();
      if (!view || !comp) return;
      this.oView = view;
      this.oRouter = comp.getRouter();

      // Controls
      const table = this.oView.byId("requisitionTable");
      if (table) {
        this.oRequisitionTable = table;
      }
    },
    onSearchFieldBasicSearch: function _onSearchFieldBasicSearch(oEvent) {
      if (!this.oRequisitionTable) return;
      const sQuery = oEvent.getParameter("query");
      const aFilters = sQuery && sQuery.length > 0 ? [new Filter("purchaseRequisition", FilterOperator.Contains, sQuery)] : [];
      const oBinding = this.oRequisitionTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters, "Application");
      }
    },
    onAddOverflowToolbarButtonPress: function _onAddOverflowToolbarButtonPress() {
      MessageBox.information("This functionality is not ready yet.", {
        title: "Aw, Snap!"
      });
    },
    onSortOverflowToolbarButtonPress: function _onSortOverflowToolbarButtonPress() {
      this._bDescendingSort = !this._bDescendingSort;
      var oBinding = this.oRequisitionTable.getBinding("items"),
        oSorter = new Sorter("purchaseRequisition", this._bDescendingSort);
      oBinding.sort(oSorter);
    },
    onColumnListItemPress: function _onColumnListItemPress(oEvent) {
      if (!this.oRouter) return;
      const source = oEvent.getSource();
      const ctx = source?.getBindingContext?.("PurchaseRequisition");
      if (!ctx) return;
      const path = ctx.getPath(); // e.g. "/PurchaseRequisition(...,IsActiveEntity=true)"
      this.oRouter.navTo("detail", {
        ctxPath: encodeURIComponent(path),
        layout: fLibrary.LayoutType.TwoColumnsMidExpanded
      });
    }
  });
  return ListController;
});
//# sourceMappingURL=List-dbg.controller.js.map
