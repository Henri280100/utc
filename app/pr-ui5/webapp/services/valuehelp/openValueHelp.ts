import Log from "sap/base/Log";
import ColumnM from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Label from "sap/m/Label";
import MultiInput from "sap/m/MultiInput";
import SearchField, { $SearchFieldSettings } from "sap/m/SearchField";
import SuggestionItem from "sap/m/SuggestionItem";
import TableM from "sap/m/Table";
import Text from "sap/m/Text";
import Token from "sap/m/Token";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import TypeString from "sap/ui/model/type/String";
import ColumnUI from "sap/ui/table/Column";
import TableUI from "sap/ui/table/Table";
import { GenericVHConfig, VHSearchConfig } from "../../types";
import { applyVHSearch } from "./applyVHSearch";



export async function openValueHelp(
  controller: Controller,
  config: GenericVHConfig,
  multipleInputId: string,
  fragmentName: string = "sap.ui.prui5.view.fragment.GenericVHDialog",
  fragmentIdPrefix: string = "GEN_VH"
): Promise<void> {
  const view = controller.getView();
  const fragId =
    (controller as any).createId?.(`${fragmentIdPrefix}_${Date.now()}`) ||
    `${fragmentIdPrefix}_${Date.now()}`;

  await Fragment.load({ id: fragId, name: fragmentName, controller });

  const vhd = Fragment.byId(fragId, "idSmartFilterBar") as ValueHelpDialog;
  const fb  = Fragment.byId(fragId, "idFilterBar") as FilterBar;
  view.addDependent(vhd);

  // ---- Dialog basics
  vhd.setTitle(vhd.getTitle() || "Select");
  vhd.setSupportMultiselect(!!config.multi);
  vhd.setSupportRanges(true);
  vhd.setKey(config.keyPath);
  if (config.textPath) vhd.setDescriptionKey(config.textPath);
  vhd.setBusyIndicatorDelay(0);          // no need to call setBusy(true)

  // Range key fields (cast due to d.ts type bug)
  const rkf = (config.filterFields ?? []).map(f => ({
    label: f.label, key: f.path, type: "string", typeInstance: new TypeString()
  }));
  (vhd as any).setRangeKeyFields(rkf);

  // Seed tokens from the calling MultiInput
  const mi = controller.byId(multipleInputId) as MultiInput;
  if (mi) vhd.setTokens(mi.getTokens());

  // ---- FilterBar toolbar + basic search
  fb.setUseToolbar(true);
  (fb as any).setShowGoOnFB?.(true);
  (fb as any).setShowClearOnFB?.(true);
  (fb as any).setShowFilterConfiguration?.(true);
  (fb as any).setFilterBarExpanded?.(true);

  // Hide variant management to dodge sap.ui.fl requirement
  (fb as any).getVariantManagement?.()?.setVisible(false);

  const sf = new SearchField({
    width: "100%",
    placeholder: "Search",
    // suggestions (optional)
    showSuggestion: !!config.suggestion?.enabled
  } as $SearchFieldSettings);

  if (config.suggestion?.enabled) {
    sf.attachSuggest(async (e) => {
      const q = (e.getParameter("suggestValue") as string) || "";
      // your existing fillSuggestions(...) util
      await fillSuggestions(sf, controller, config, q);
    });
  }
  sf.attachSearch(() => fb.search());
  (fb as any).setBasicSearch(sf); // runtime API

  // Filter fields as token-capable controls
  (config.filterFields ?? []).forEach((f) => {
    const fieldMI = new MultiInput({ placeholder: f.label, showValueHelp: true });
    const debounced = debounce(() => fb.search(), 250);
    fieldMI.attachLiveChange(debounced);
    fieldMI.attachTokenUpdate(debounced);

    fb.addFilterGroupItem(
      new FilterGroupItem({
        groupName: "_BASIC",
        name: f.path,
        label: f.label,
        control: fieldMI,
        visibleInAdvancedArea: true
      })
    );
  });

  // ---- Table wiring: use ONLY the VHD’s internal table
  const table = await vhd.getTableAsync();
  const release = () => vhd.update();

  const isUiTable = (t: any): t is TableUI => !!t?.bindRows;
  const isMTable  = (t: any): t is TableM => !!t?.bindItems;

  if (isUiTable(table)) {
    // columns
    config.columns.forEach((c) => {
      const col = new ColumnUI({
        label: new Label({ text: c.label }),
        template: new Text({ text: `{${config.modelName}>${c.path}}`, wrapping: false })
      });
      (col as any).data({ fieldName: c.path });
      table.addColumn(col);
    });
    // bind rows (V4: $select string)
    table.bindAggregation("rows", {
      path: `${config.modelName}>${config.entityPath}`,
      parameters: config.select?.length ? { $select: config.select.join(",") } : undefined
    });
    table.attachEvent("rowsUpdated", release);

  } else if (isMTable(table)) {
    // columns
    config.columns.forEach((c) =>
      table.addColumn(new ColumnM({ header: new Label({ text: c.label }) }))
    );
    // row template
    const row = new ColumnListItem({
      cells: config.columns.map((c) => new Text({ text: `{${config.modelName}>${c.path}}` }))
    });
    // bind items
    table.bindAggregation("items", {
      path: `${config.modelName}>${config.entityPath}`,
      template: row,
      parameters: config.select?.length ? { $select: config.select.join(",") } : undefined
    });
    table.attachUpdateFinished(release);
  }

  // hook up FB and clear busy once
  vhd.setFilterBar(fb);
  release();

  // Expose table id for your 2-arg applyVHSearch
  const vhCfg: VHSearchConfig = {
    modelName: config.modelName,
    tableId: (table as any).getId(),
    basicSearchPaths: config.basicSearchPaths,
    useODataSearch: !!config.useODataSearch,
    entityPath: config.entityPath,
    keyPath: config.keyPath,
    textPath: config.textPath,
    select: config.select
  } as any;
  fb.setModel(new TypedJSONModel<VHSearchConfig>(vhCfg), "vh");

  // Go button → apply filters
  fb.attachSearch(() => runApply());

  // OK / Cancel
  vhd.attachOk((e) => {
    const tokens = e.getParameter("tokens") as Token[];
    if (mi) {
      mi.removeAllTokens();
      tokens.forEach((t) => mi.addToken(t.clone()));
    }
    vhd.close();
  });
  vhd.attachCancel(() => vhd.close());
  vhd.attachAfterClose(() => vhd.destroy());
  vhd.open();

  function runApply(): void {
    const original = (fb as any).getBasicSearchValue;
    (fb as any).getBasicSearchValue = () => sf.getValue();
    applyVHSearch(controller, fb);     // your existing helper
    (fb as any).getBasicSearchValue = original;
  }
}

// tiny debounce helper
function debounce<T extends (...a: any[]) => void>(fn: T, ms = 250): T {
  let t: any;
  return ((...args: any[]) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }) as T;
}

async function fillSuggestions(
  searchField: SearchField,
  controller: Controller,
  config: GenericVHConfig,
  typed: string
): Promise<void> {
  searchField.destroySuggestionItems();

  const query = (typed || "").trim();
  if (!query) return;

  const view = controller.getView();
  const model = view.getModel(config.modelName) as ODataModel;

  const suggestion = config.suggestion || {};
  const path = suggestion.entityPath || config.entityPath;
  const max = suggestion.maxItems ?? 8;
  const display = suggestion.displayPath || config.textPath || config.keyPath;
  const secondary = suggestion.secondaryPath;

  // OR filter across basicSearchPaths
  const orFilter = new Filter({
    and: false,
    filters: config.basicSearchPaths.map(
      (p) =>
        new Filter({
          path: p,
          operator: FilterOperator.Contains,
          value1: query,
        })
    ),
  });

  const list = model.bindList(path, undefined, undefined, undefined, {
    $select: config.select?.join(","),
  }) as ODataListBinding;

  list.filter(orFilter);

  try {
    const context = await list.requestContexts(0, max);
    context.forEach((ctx) => {
      const obj = ctx.getObject() as Record<string, any>;
      searchField.addSuggestionItem(
        new SuggestionItem({
          key: String(obj[config.keyPath]),
          text: String(obj[display] ?? ""),
          description: config.suggestion?.secondaryPath
            ? String(obj[config.suggestion?.secondaryPath] ?? "")
            : undefined,
        })
      );
    });
  } catch (error: Error | any) {
    Log.warning("ValueHelp suggestion failed: ", error);
  }
}