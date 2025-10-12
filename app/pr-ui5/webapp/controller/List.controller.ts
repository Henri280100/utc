import * as fLibrary from "sap/f/library";
import MessageBox from "sap/m/MessageBox";
import MultiInput from "sap/m/MultiInput";
import Table from "sap/m/Table";
import Token from "sap/m/Token";
import Event from "sap/ui/base/Event";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import formatter from "../models/formatter";
import { openValueHelp } from "../services";
import { GenericVHConfig } from "../types";

export default class ListController extends Controller {
  private oView: View;
  private _bDescendingSort: boolean = false;
  private oRequisitionTable: any;
  private oRouter: Router | undefined;
  public formatter = formatter;

  private _vhDialog?: ValueHelpDialog;
  private _vhTable?: Table;

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

  onSettingOverflowToobarButtonPress(): void {}

  public onMenuItemSelected(oEvent: Event): void {}

  public async onMultiInputValueHelpRequest(): Promise<void> {
    const cfg: GenericVHConfig = {
      modelName: "PurchaseRequisition",
      entityPath: "/PurchasingGroups",
      keyPath: "purchasingGroup",
      textPath: "purchasingGroupDescription",
      columns: [
        { label: "purchasingGroup", path: "purchasingGroup" },
        {
          label: "purchasingGroupDescription",
          path: "purchasingGroupDescription",
        },
      ],
      filterFields: [
        { label: "purchasingGroup", path: "purchasingGroup" },
        {
          label: "purchasingGroupDescription",
          path: "purchasingGroupDescription",
        },
      ],
      basicSearchPaths: ["purchasingGroup", "purchasingGroupDescription"],
      select: ["purchasingGroup", "purchasingGroupDescription"],
      multi: true,
      suggestion: {
        enabled: true,
        displayPath: "purchasingGroup",
        secondaryPath: "purchasingGroupDescription",
      },
    };

    await openValueHelp(this, cfg, "idPurchasingGroupIDMultiInput");
  }

  private _applyVHSelectionToTokens(): void {
    const multipleInput = this.byId(
      "idPurchasingGroupIDMultiInput"
    ) as MultiInput;
    if (!multipleInput || !this._vhTable) {
      this._vhDialog?.close();
      return;
    }

    const selectedItem = this._vhTable.getSelectedItems();
    multipleInput.removeAllTokens();

    selectedItem.forEach((item) => {
      const context = item.getBindingContext("PurchaseRequisition");
      if (!context) return;

      const key = context.getProperty("purchasingGroup") as string;
      const text =
        context.getProperty("purchasingGroupDescription" as string) || key;
      multipleInput.addToken(new Token({ key, text }));
    });
    this._vhDialog?.close();
  }

  public onMultiInputTokenUpdate(): void {
    this._applyVHSelectionToTokens();
  }

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
