import Table from "sap/m/Table";
import SmartFilterBar from "sap/ui/comp/smartfilterbar/SmartFilterBar";
import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterType from "sap/ui/model/FilterType";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import ListBinding from "sap/ui/model/ListBinding";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import { VHSearchConfig } from "../../types";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import Element from "sap/ui/core/Element";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import MultiInput from "sap/m/MultiInput";

export function applyVHSearch(
  controller: Controller,
  sfb: SmartFilterBar | FilterBar,
  queryOverride?: string
) {
  const config = (
    sfb.getModel("vh") as TypedJSONModel<VHSearchConfig> | null
  )?.getData();

  if (!config) throw new Error("VH config model ('vh') is missing.");

  const raw = (sfb as SmartFilterBar)?.getFilters?.();
  const sfbFilters: Filter[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

  const query = (queryOverride ??
    (sfb as FilterBar).getBasicSearchValue?.()) as string | undefined;

  const basic =
    query && config.basicSearchPaths.length
      ? new Filter({
          filters: config.basicSearchPaths.map(
            (p) => new Filter(p, FilterOperator.Contains, query)
          ),
          and: false,
        })
      : null;

  const table =
    (controller.byId(config.tableId) as Table) ||
    (Element.getElementById(config.tableId) as Table);

  if (!table) throw new Error(`Table '${config.tableId}' not found.`);

  const agg = table.getBinding("items") ? "items" : "rows";
  const binding = table.getBinding(agg) as ListBinding;

  if (!binding) {
    return;
  }

  // Collect Filters
  const filters: Filter[] = [];

  if (sfb.isA("sap.ui.comp.smartfilterbar.SmartFilterBar")) {
    const raw = (sfb as SmartFilterBar)?.getFilters?.();
    if (raw) filters.push(...(Array.isArray(raw) ? raw : [raw]));
  } else {
    const filterBar = sfb as FilterBar;
    const fGroupItem = (sfb as FilterBar).getFilterGroupItems?.() as
      | FilterGroupItem[]
      | undefined;

    (fGroupItem || []).forEach((fgi) => {
      const path = (fgi as FilterGroupItem).getName?.() as string;
      const ctrl = (fgi as FilterGroupItem).getControl?.() as
        | MultiInput
        | undefined;

      const val =
        ctrl?.getValue?.() ??
        ctrl?.getSelectedKey?.() ??
        (ctrl
          ?.getTokens?.()
          ?.map((t: any) => t.getKey?.() || t.getText?.() || "")
          .join(",") ||
          "");
      if (path && val)
        filters.push(new Filter(path, FilterOperator.Contains, val));
    });
  }

  // Basic Search -> OR across config.basicSearchPaths
  const bSearch = (sfb as FilterBar).getBasicSearchValue?.() as
    | string
    | undefined;
  if (bSearch && config.basicSearchPaths?.length) {
    filters.push(
      new Filter({
        filters: config.basicSearchPaths.map(
          (p) => new Filter(p, FilterOperator.Contains, bSearch)
        ),
        and: false,
      })
    );
  }

  if (
    config.useODataSearch &&
    binding.isA?.("sap.ui.model.odata.v4.ODataListBinding")
  ) {
    (binding as unknown as ODataListBinding).changeParameters({
      $search: query || undefined,
    });
  }

  const combined = [...sfbFilters, ...(basic ? [basic] : [])];
  binding.filter(combined, FilterType.Application);
}
