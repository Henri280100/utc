sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
  ],
  (Controller, Filter, FilterOperator, Sorter, MessageBox) => {
    "use strict";

    return Controller.extend("sap.ui.prui5.controller.List", {
      onInit: function () {
        this.oView = this.getView();
        this._bDescendingSort = false;
        this.oRequisitionTable = this.oView.byId("requisitionTable");
        this.oRouter = this.getOwnerComponent().getRouter();
      },

      onSearchFieldBasicSearch: function (oEvent) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter("purchaseRequisition", FilterOperator.Contains, sQuery),
          ];
        }

        this.oRequisitionTable
          .getBinding("items")
          .filter(oTableSearchState, "Application");
      },

      onAddOverflowToolbarButtonPress: function () {
        MessageBox.information("This functionality is not ready yet.", {
          title: "Aw, Snap!",
        });
      },

      onSortOverflowToolbarButtonPress: function () {
        this._bDescendingSort = !this._bDescendingSort;
        var oBinding = this.oRequisitionTable.getBinding("items"),
          oSorter = new Sorter("purchaseRequisition", this._bDescendingSort);

        oBinding.sort(oSorter);
      },

      onColumnListItemPress: function (oEvent) {
        const ctx = oEvent.getSource().getBindingContext("PurchaseRequisition");
        if (!ctx) return;
        const path = ctx.getPath(); // e.g. "/PurchaseRequisition(...,IsActiveEntity=true)"
        this.oRouter.navTo("detail", {
          ctxPath: encodeURIComponent(path),
          layout: sap.f.LayoutType.TwoColumnsMidExpanded,
        });
      },
    });
  }
);
