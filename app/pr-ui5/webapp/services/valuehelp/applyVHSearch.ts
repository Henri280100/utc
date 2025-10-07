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
import Token from "sap/m/Token";
import CustomData from "sap/ui/core/CustomData";

const OP_MAP: Record<string, FilterOperator> = {
  EQ: FilterOperator.EQ,
  NE: FilterOperator.NE,
  LT: FilterOperator.LT,
  LE: FilterOperator.LE,
  GT: FilterOperator.GT,
  GE: FilterOperator.GE,
  BT: FilterOperator.BT,
  Contains: FilterOperator.Contains,
  StartWith: FilterOperator.StartsWith,
  EndsWith: FilterOperator.EndsWith,
};

export function applyVHSearch(
  controller: Controller,
  sfb: SmartFilterBar | FilterBar
) {
   const config = (sfb.getModel("vh") as TypedJSONModel<VHSearchConfig> | null)?.getData();
  if (!config) throw new Error("VH config model ('vh') is missing.");

  const table: any = controller.byId(config.tableId) || Element.getElementById(config.tableId);
  if (!table) throw new Error(`Table '${config.tableId}' not found.`);

  const agg = table.getBinding("items") ? "items" : "rows";
  const binding = table.getBinding(agg) as ListBinding | null;
  if (!binding) return;

  // Collect Filters
  const filters: Filter[] = [];

  if (sfb.isA("sap.ui.comp.smartfilterbar.SmartFilterBar")) {
    const raw = (sfb as SmartFilterBar)?.getFilters?.();
    if (raw) filters.push(...(Array.isArray(raw) ? raw : [raw]));
  } else {
    const filterBar = sfb as FilterBar;
    const fGroupItem = (filterBar as FilterBar).getFilterGroupItems?.() as
      | FilterGroupItem[]
      | undefined;

    (fGroupItem ?? []).forEach((fgi) => {
      const path = (fgi as FilterGroupItem).getName?.() as string;
      const ctrl = (fgi as FilterGroupItem).getControl?.() as
        | MultiInput
        | undefined;
      if (!path || !ctrl) return;

      if (typeof ctrl.getTokens === "function") {
        const tokens = ctrl.getTokens() || [];
        const fieldFilters: Filter[] = [];

        tokens.forEach((t: Token) => {
          // VHD stores the range payload on the token as custom data "range"
          const ranges =
            (typeof t.data === "function" && t.data("ranges")) ||
            extractRangeCustomData(t);
          if (!ranges) return;

          const operations = OP_MAP[ranges.operation];
          if (!operations) return;

          if (operations === FilterOperator.BT) {
            fieldFilters.push(
              new Filter(path, operations, ranges.value1, ranges.value2)
            );
          } else if (
            operations === FilterOperator.Contains ||
            operations === FilterOperator.StartsWith ||
            operations === FilterOperator.EndsWith ||
            operations === FilterOperator.EQ ||
            operations === FilterOperator.NE ||
            operations === FilterOperator.LT ||
            operations === FilterOperator.LE ||
            operations === FilterOperator.GT ||
            operations === FilterOperator.GE
          ) {
            fieldFilters.push(new Filter(path, operations, ranges.value1));
          }
        });

        if (fieldFilters.length) {
          filters.push(new Filter({ and: false, filters: fieldFilters }));
          return;
        }
      }

      const val =
        ctrl?.getValue?.() ??
        ctrl?.getSelectedKey?.() ??
        (ctrl
          ?.getTokens?.()
          ?.map((t: Token) => t.getKey?.() || t.getText?.() || "")
          .join(",") ||
          "");
      if (path && val)
        filters.push(new Filter(path, FilterOperator.Contains, val));
    });
  }

  // Basic search (OR across paths)
  const basic = (sfb as any).getBasicSearchValue?.() as string | undefined;
  if (basic && config.basicSearchPaths?.length) {
    filters.push(new Filter({
      and: false,
      filters: config.basicSearchPaths.map(p => new Filter(p, FilterOperator.Contains, basic))
    }));
  }

  // Optional: backend $search for V4
  if (config.useODataSearch && (binding as any).isA?.("sap.ui.model.odata.v4.ODataListBinding")) {
    (binding as unknown as ODataListBinding).changeParameters({ $search: basic || undefined });
  }

  binding.filter(filters, FilterType.Application);
}
function extractRangeCustomData(t: Token): any {
  const customData =
    typeof t.getCustomData === "function" ? t.getCustomData() : null;
  if (!Array.isArray(customData)) return null;

  const entry = customData.find(
    (c: CustomData) => c && c.getKey && c.getKey() === "ranges"
  );

  return entry ? entry.getValue?.() : null;
}
