import * as fLibrary from "sap/f/library";
import MessageBox from "sap/m/MessageBox";
import Table from "sap/m/Table";
import Event from "sap/ui/base/Event";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import formatter from "../models/formatter";


export default class ListController extends Controller {
  private oView: View;
  private _bDescendingSort: boolean = false;
  private oRequisitionTable: any;
  private oRouter: Router | undefined;
  public formatter = formatter;
  
  public onInit(): void {
    // View & Router
    const view = this.getView();
    const comp = this.getOwnerComponent() as UIComponent;
    if (!view || !comp) return;

    this.oView = view as View;
    this.oRouter = comp.getRouter();

    // Controls
    const table = this.oView.byId("requisitionTable") as Table | undefined;
    if (table) {
      this.oRequisitionTable = table;
    }
  }

  onSearchFieldBasicSearch(oEvent: Event) {
    if (!this.oRequisitionTable) return;

    const sQuery = (oEvent.getParameter as any)("query") as string | undefined;
    const aFilters: Filter[] =
      sQuery && sQuery.length > 0
        ? [new Filter("purchaseRequisition", FilterOperator.Contains, sQuery)]
        : [];

    const oBinding = this.oRequisitionTable.getBinding("items") as ListBinding;
    if (oBinding) {
      oBinding.filter(aFilters, "Application");
    }
  }

  onAddOverflowToolbarButtonPress(): void {
    MessageBox.information("This functionality is not ready yet.", {
      title: "Aw, Snap!",
    });
  }

  onSortOverflowToolbarButtonPress(): void {
    this._bDescendingSort = !this._bDescendingSort;
    var oBinding = this.oRequisitionTable.getBinding("items"),
      oSorter = new Sorter("purchaseRequisition", this._bDescendingSort);

    oBinding.sort(oSorter);
  }

  public onMenuItemSelected(oEvent: Event): void {}

  public onMultiInputValueHelpRequest(): void {}

  public onMultipleInputTokenUpdate(): void {}

  public onGoButtonPress(): void {}

  public onFilterOverflowToolbarButtonPress(): void {}

  onColumnListItemPress(oEvent: Event) {
    if (!this.oRouter) return;

    const source = oEvent.getSource() as any;
    const ctx = source?.getBindingContext?.("PurchaseRequisition");
    if (!ctx) return;

    const path = ctx.getPath() as string; // e.g. "/PurchaseRequisition(...,IsActiveEntity=true)"
    this.oRouter.navTo("detail", {
      ctxPath: encodeURIComponent(path),
      layout: fLibrary.LayoutType.TwoColumnsMidExpanded,
    });
  }
}
