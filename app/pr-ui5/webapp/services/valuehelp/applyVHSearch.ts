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

export function applyVHSearch(controller: Controller, sfb: SmartFilterBar | FilterBar, queryOverride?: string) {
  const config = (
    sfb.getModel("vh") as TypedJSONModel<VHSearchConfig> | null
  ).getData();

  if (!config) throw new Error("VH config model ('vh') is missing.");
  
  const raw = (sfb as SmartFilterBar)?.getFilters?.();
  const sfbFilters: Filter[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

  const query = (queryOverride ?? (sfb as FilterBar).getBasicSearchValue?.()) as string | undefined;

  const basic =
    query && config.basicSearchPaths.length
      ? new Filter({
          filters: config.basicSearchPaths.map(
            (p) => new Filter(p, FilterOperator.Contains, query)
          ),
          and: false,
        })
      : null;

  const table = controller.byId(config.tableId) as Table | null;
  if (!table) throw new Error(`Table '${config.tableId}' not found.`);

  const binding = table.getBinding("items") as ListBinding;

  if (!binding) {
    return;
  }

  if (
    config.useODataSearch &&
    binding.isA("sap.ui.model.odata.v4.ODataListBinding")
  ) {
    (binding as unknown as ODataListBinding).changeParameters({
      $search: query || undefined,
    });
  }

  const combined = [...sfbFilters, ...(basic ? [basic] : [])];
  binding.filter(combined, FilterType.Application);
}
