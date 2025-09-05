sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/f/library"
  ],
  (Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary, LayoutType) => {
    "use strict";

    return Controller.extend("sap.ui.prui5.controller.List", {
      onInit: function () {
        this.oView = this.getView();
        this._bDescendingSort = false;
        this.oRequisitionTable = this.oView.byId("requisitionTable");
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

      onColumnListItemPress: function () {
        var oFCL = this.oView.getParent().getParent();

        oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
      },
    });
  }
);
