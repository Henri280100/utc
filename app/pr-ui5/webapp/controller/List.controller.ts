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
import Dialog from "sap/m/Dialog";
import SmartFilterBar from "sap/ui/comp/smartfilterbar/SmartFilterBar";
import { applyVHSearch } from "../services/valuehelp/applyVHSearch";
import VBox from "sap/m/VBox";
import Button from "sap/m/Button";
import Column from "sap/m/Column";
import Text from "sap/m/Text";
import ColumnListItem from "sap/m/ColumnListItem";
import { VHSearchConfig } from "../types";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import MultiInput from "sap/m/MultiInput";
import Token from "sap/m/Token";

export default class ListController extends Controller {
  private oView: View;
  private _bDescendingSort: boolean = false;
  private oRequisitionTable: any;
  private oRouter: Router | undefined;
  public formatter = formatter;

  private _vhDialog?: Dialog;
  private _vhTable?: Table;
  private _vhSfb?: SmartFilterBar;

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
    await this._ensureValueHelp();
    this._vhDialog!.open();
  }

  private async _ensureValueHelp(): Promise<void> {
    if (this._vhDialog) return;

    // dialog shell
    this._vhDialog = new Dialog({
      title: "Purchasing Groups",
      draggable: true,
      resizable: true,
      contentWidth: "800px",
      contentHeight: "70%",
      content: new VBox({ fitContainer: true }),
      beginButton: new Button({
        text: "Ok",
        press: () => this._applyVHSelectionToTokens(),
      }),
      endButton: new Button({
        text: "Cancel",
        press: () => this._vhDialog!.close(),
      }),
      afterClose: () => {},
    });
    this.getView().addDependent(this._vhDialog);

    const fragment = await this.loadFragment({
      name: "sap.ui.prui5.view.fragment.GenericVHSmartFB",
      id: this.createId("idPurchasingGroupVH"),
    });

    (this._vhDialog.getContent()[0] as VBox).addItem(fragment as any);

    this._vhSfb = this.byId("idSmartFilterBar") as SmartFilterBar;

    this._vhTable = new Table({
      id: this.createId("idPGTable"),
      mode: "MultiSelect",
      growing: true,
      columns: [
        new Column({ header: new Text({ text: "PG" }) }),
        new Column({ header: new Text({ text: "Description" }) }),
      ],
    });

    const template = new ColumnListItem({
      cells: [
        new Text({ text: "{PurchaseRequisition>purchasingGroup}" }),
        new Text({ text: "{PurchaseRequisition>purchasingGroupDescription}" })
      ],
    });

    this._vhTable.bindItems({
      path: "PurchaseRequisition>/PurchasingGroup",
      template,
      parameters: {
        $select: ["purchasingGroup", "purchasingGroupDescription"],
      },
    });

    (this._vhDialog.getContent()[0] as VBox).addItem(this._vhTable);

    const config: VHSearchConfig = {
      modelName: "PurchaseRequisition",
      tableId: this._vhTable.getId(),
      basicSearchPaths: ["purchasingGroup", "purchasingGroupDescription"],
      useODataSearch: false,
    };

    this._vhSfb?.setModel(new TypedJSONModel<VHSearchConfig>(config), "vh");
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

  public onVHSearch(e: Event): void {
    applyVHSearch(this, e.getSource() as SmartFilterBar);
  }

  public onMultiInputTokenUpdate(): void {}

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
