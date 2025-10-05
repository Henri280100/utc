import * as fLibrary from "sap/f/library";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Input from "sap/m/Input";
import MessageBox from "sap/m/MessageBox";
import MultiInput from "sap/m/MultiInput";
import Table from "sap/m/Table";
import Text from "sap/m/Text";
import Token from "sap/m/Token";
import Event from "sap/ui/base/Event";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterType from "sap/ui/model/FilterType";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import formatter from "../models/formatter";
import { VHSearchConfig } from "../types";
import SearchField from "sap/m/SearchField";

export default class ListController extends Controller {
  private oView: View;
  private _bDescendingSort: boolean = false;
  private oRequisitionTable: any;
  private oRouter: Router | undefined;
  public formatter = formatter;

  private _vhDialog?: ValueHelpDialog;
  private _vhTable?: Table;
  private _vhSfb?: FilterBar;
  private _vhdSearch?: SearchField;
  private _vhCfg: VHSearchConfig = {
    tableId: "idPurchaseRequisitionTable",
    modelName: "PurchaseRequisition",
    entityPath: "/PurchasingGroups",
    keyPath: "purchasingGroup",
    textPath: "purchasingGroupDescription",
    select: ["purchasingGroup", "purchasingGroupDescription"],
    basicSearchPaths: ["purchasingGroup", "purchasingGroupDescription"],
  };

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

    // 1) Load the reusable VHD fragment
    const fragId = this.createId("PGVHD");
    await Fragment.load({
      id: fragId,
      name: "sap.ui.prui5.view.fragment.GenericVHDialog",
      controller: this,
    });

    this._vhDialog = Fragment.byId(
      fragId,
      "idSmartFilterBar"
    ) as ValueHelpDialog;
    this._vhSfb = Fragment.byId(fragId, "vhdFilterBar") as FilterBar;
    this.getView().addDependent(this._vhDialog);

    // 2) Configure VHD (key/description for tokens)
    this._vhDialog?.setTitle("Purchasing Groups");
    this._vhDialog?.setSupportMultiselect(true);
    this._vhDialog.setSupportRanges(false);
    this._vhDialog.setKey(this._vhCfg.keyPath);
    this._vhDialog.setDescriptionKey(this._vhCfg.textPath);
    this._vhDialog.setBasicSearchText("")
    this._vhDialog.attachSearch(this._applyVHFilters.bind(this));


    const mi = this.byId("idPurchasingGroupIDMultiInput") as MultiInput;
    if (mi) this._vhDialog.setTokens(mi.getTokens());

    // 3) FilterBar: add a basic search (on the bar, like your screenshot)
    this._vhdSearch = new SearchField({
      width: "100%",
      placeholder: "Search",
      search: (e) => this._applyVHFilters(e.getParameter("query") || ""),
      // (optional) liveChange: (e) => this._applyVHFilters(e.getParameter("newValue") || "")
    });
    (this._vhSfb as FilterBar)?.setBasicSearch(this._vhdSearch);

    // show the filter line by default (optional)
    (this._vhSfb as FilterBar)?.setFilterBarExpanded?.(true);

    // add two simple fields so “Filters/Clear/Hide Filters” are enabled
    this._vhSfb?.addFilterGroupItem(
      new FilterGroupItem({
        groupName: "__$INTERNAL$",
        name: this._vhCfg.keyPath, // "purchasingGroup"
        label: "purchasingGroup",
        control: new Input({ placeholder: "purchasingGroup" }),
        visibleInAdvancedArea: true,
        visibleInFilterBar: true,
      })
    );
    this._vhSfb?.addFilterGroupItem(
      new FilterGroupItem({
        groupName: "__$INTERNAL$",
        name: this._vhCfg.textPath, // "purchasingGroupDescription"
        label: "purchasingGroupDescription",
        control: new Input({ placeholder: "purchasingGroupDescription" }),
        visibleInAdvancedArea: true,
        visibleInFilterBar: true,
      })
    );

    // 4) Result table + binding
    const modelName = this._vhCfg?.modelName;
    this._vhTable = new Table({
      mode: "MultiSelect",
      growing: true,
      columns: [
        new Column({ header: new Text({ text: "purchasingGroup" }) }),
        new Column({
          header: new Text({ text: "purchasingGroupDescription" }),
        }),
      ],
    });
    const row = new ColumnListItem({
      cells: [
        new Text({ text: `{${modelName}>${this._vhCfg.keyPath}}` }),
        new Text({ text: `{${modelName}>${this._vhCfg.textPath}}` }),
      ],
    });
    this._vhTable.bindItems({
      path: `${modelName}>${this._vhCfg.entityPath}`,
      template: row,
      parameters: { $select: this._vhCfg.select },
    });
    this._vhDialog.setTable(this._vhTable);

    // let dialog layout itself after wiring
    this._vhDialog.update();
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

  public onValueHelpDialogSearch(e: any): void {
    const q = (e.getParameter("value") as string) || "";
    this._applyVHFilters(q);
  }

  public onFilterBarSearch(): void {
    const q = this._vhdSearch?.getValue() || "";
    this._applyVHFilters(q);
  }

  /** Build filters from VHD basic search + FilterBar fields, apply to table */
  private _applyVHFilters(query: string): void {
    const b = this._vhTable?.getBinding("items") as ListBinding | null;
    if (!b) return;

    const filters: Filter[] = [];

    // A) basic search → OR across ID + Description
    const q = (query || "").trim();
    if (q) {
      filters.push(
        new Filter({
          filters: [
            new Filter(this._vhCfg.keyPath, FilterOperator.Contains, q),
            new Filter(this._vhCfg.textPath, FilterOperator.Contains, q),
          ],
          and: false,
        })
      );
    }

    // B) explicit field inputs from FilterBar
    const items = (this._vhSfb as any).getFilterGroupItems?.() as
      | FilterGroupItem[]
      | undefined;
    (items ?? []).forEach((fgi) => {
      const name = (fgi as any).getName?.() as string;
      const ctrl = (fgi as any).getControl?.() as Input | undefined;
      const val = ctrl?.getValue?.();
      if (name && val)
        filters.push(new Filter(name, FilterOperator.Contains, val));
    });

    b.filter(filters, FilterType.Application);
  }

  public onValueHelpDialogOk(e: any): void {
    const tokens = e.getParameter("tokens") as Token[]; // created using key/descriptionKey
    const mi = this.byId("idPurchasingGroupIDMultiInput") as MultiInput;
    mi.removeAllTokens();
    tokens.forEach((t) => mi.addToken(t.clone()));
    this._vhDialog?.close();
  }
  public onValueHelpDialogCancel(): void {
    this._vhDialog?.close();
  }
  public onValueHelpDialogAfterClose(): void {
    /* optional cleanup */
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
