import Log from "sap/base/Log";
import ColumnM from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Input from "sap/m/Input";
import Label from "sap/m/Label";
import MultiInput from "sap/m/MultiInput";
import SearchField from "sap/m/SearchField";
import SuggestionItem from "sap/m/SuggestionItem";
import TableM from "sap/m/Table";
import Text from "sap/m/Text";
import Token from "sap/m/Token";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import Device from "sap/ui/Device";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ColumnUI from "sap/ui/table/Column";
import TableUI from "sap/ui/table/Table";
import { GenericVHConfig, VHSearchConfig } from "../../types";
import { applyVHSearch } from "./applyVHSearch";

export async function openValueHelp(
  controller: Controller,
  config: GenericVHConfig,
  multipleInputId: string,
  fragmentName = "sap.ui.prui5.view.fragment.GenericVHDialog",
  fragmentIdPrefix = "GEN_VH"
): Promise<void> {
  const view = controller.getView();
  const fragId =
    (controller as Controller).createId?.(
      `${fragmentIdPrefix}_${Date.now()}`
    ) || `${fragmentIdPrefix}_${Date.now()}`;

  await Fragment.load({
    id: fragId,
    name: fragmentName,
    controller,
  });

  const valueHelpDialog = Fragment.byId(
    fragId,
    "idSmartFilterBar"
  ) as ValueHelpDialog;
  const filterBar = Fragment.byId(fragId, "idFilterBar") as FilterBar;
  view.addDependent(valueHelpDialog);

  // dialog basics
  valueHelpDialog.setTitle(valueHelpDialog.getTitle() || "Select");
  valueHelpDialog.setSupportMultiselect(!!config.multi);
  valueHelpDialog.setSupportRanges(false);
  valueHelpDialog.setKey(config.keyPath);
  if (config.textPath) valueHelpDialog.setDescriptionKey(config.textPath);
  valueHelpDialog.setBasicSearchText("");

  // Seed tokens
  const multipleInput = controller.byId(multipleInputId) as MultiInput;
  if (multipleInput) valueHelpDialog.setTokens(multipleInput.getTokens());

  filterBar.setUseToolbar(true);
  (filterBar as FilterBar).setShowGoOnFB(true);
  (filterBar as FilterBar).setShowClearOnFB(true);
  (filterBar as FilterBar).setShowFilterConfiguration(true);
  (filterBar as FilterBar).setFilterBarExpanded(true);

  // Basic Search field (with OR without suggestions)
  const searchField = new SearchField({
    width: "100%",
    placeholder: "Search",
  });

  if (config.suggestion?.enabled) {
    searchField.setEnableSuggestions(true);
    searchField.attachSuggest(async (e) => {
      const query = (e.getParameter("suggestValue") as string) || "";
      await fillSuggestions(searchField, controller, config, query);
    });
  }

  searchField.attachSearch(() => filterBar.search());
  (filterBar as FilterBar).setBasicSearch(searchField);

  (config.filterFields ?? []).forEach((filter) =>
    filterBar.addFilterGroupItem(
      new FilterGroupItem({
        groupName: "__$INTERNAL$",
        name: filter.path,
        label: filter.label,
        control: new Input({ placeholder: filter.label }),
        visibleInFilterBar: true,
      })
    )
  );

  const isDesktop = !!Device.system.desktop;
  let table: TableM | TableUI;

  if (isDesktop) {
    const uiTable = new TableUI({
      selectionMode: config.multi ? "MultiToggle" : "Single",
    });
    config.columns.forEach((c) => {
      const col = new ColumnUI({
        label: new Label({ text: c.label }),
        template: new Text({
          text: `{${config.modelName}>${c.path}}`,
          wrapping: false,
        }),
      });
      (col as ColumnUI).data({ fieldName: c.path });
      uiTable.addColumn(col);
    });
    uiTable.bindAggregation("rows", {
      path: `${config.modelName}>${config.entityPath}`,
      parameters: config.select?.length
        ? { $select: config.select }
        : undefined,
      events: { dataReceived: () => valueHelpDialog.update() },
    });
    table = uiTable;
  } else {
    const mTable = new TableM({
      mode: config.multi ? "MultiSelect" : "SingleSelectMaster",
      growing: true,
    });
    config.columns.forEach((c) =>
      mTable.addColumn(new ColumnM({ header: new Label({ text: c.label }) }))
    );
    const row = new ColumnListItem({
      cells: config.columns.map(
        (c) => new Text({ text: `{${config.modelName}>${c.path}}` })
      ),
    });
    mTable.bindAggregation("items", {
      path: `${config.modelName}>${config.entityPath}`,
      template: row,
      parameters: config.select?.length
        ? { $select: config.select }
        : undefined,
      events: { dataReceived: () => valueHelpDialog.update() },
    });
    table = mTable;
  }

  valueHelpDialog.setTable(table);
  valueHelpDialog.setFilterBar(filterBar);
  valueHelpDialog.update();

  const vhConfig: VHSearchConfig = {
    modelName: config.modelName,
    tableId: table.getId(),
    basicSearchPaths: config.basicSearchPaths,
    useODataSearch: !!config.useODataSearch,
    entityPath: config.entityPath,
    keyPath: config.keyPath,
    textPath: config.textPath,
    select: config.select,
  } as any;

  filterBar.setModel(new TypedJSONModel<VHSearchConfig>(vhConfig), "vh");

  filterBar.attachSearch(() => runApply());

  valueHelpDialog.attachOk((e) => {
    const tokens = e.getParameter("tokens") as Token[]; // created using key/descriptionKey
    if (multipleInput) {
      multipleInput.removeAllTokens();
      tokens.forEach((t) => multipleInput.addToken(t.clone()));
    }
    valueHelpDialog.close();
  });

  valueHelpDialog.attachCancel(() => valueHelpDialog.close());
  valueHelpDialog.attachAfterClose(() => valueHelpDialog.destroy());
  valueHelpDialog.open();

  function runApply(): void {
    const original = (filterBar as any).getBasicSearchValue;
    // shim so your existing helper reads the FilterBar basic search text:
    (filterBar as FilterBar).getBasicSearchValue = () => searchField.getValue();
    applyVHSearch(controller, filterBar); // ← your 2-arg function
    (filterBar as FilterBar).getBasicSearchValue = original;
  }
}

/**
 * Fill suggestions for a SearchField based on the query given.
 * @param {SearchField} searchField - the SearchField to fill suggestions for
 * @param {Controller} controller - the controller to get the model from
 * @param {GenericVHConfig} config - the configuration for the value help
 * @param {string} typed - the query to search for
 * @returns {Promise<void>} - a promise that resolves when the suggestions have been filled
 */
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
