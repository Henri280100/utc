'use strict';

/**
 * @fileoverview
 * Expand builder utilities for CAP CDS SELECT queries.
 *
 * Provides a recursive, tree-driven approach to building OData `$expand`
 * projections. The expand shape is declared as a plain JS object (the
 * "expand tree"), which is then translated into the fluent column-builder
 * callbacks that `SELECT.from().columns()` expects.
 *
 * @example <caption>Basic usage</caption>
 * import { buildExpand } from './BuildExpand';
 *
 * const tree = {
 *   $columns: ['purchaseRequisition', 'quantity'],
 *   material: {
 *     $columns: ['material', 'baseUnit'],
 *   },
 *   plant: {
 *     $columns: '*',
 *   },
 * };
 *
 * const result = await SELECT.from(PurchaseRequisition)
 *   .columns(buildExpand(tree, req.query.SELECT.columns));
 */

/**
 * @typedef {string[] | '*'} ColumnProjection
 * Either an explicit list of column names to select, or the string `'*'`
 * to select all columns on that entity / navigation.
 */

/**
 * @typedef {Object} ExpandTree
 * A plain-object description of the expand shape for one entity level.
 *
 * - The special key `$columns` declares which scalar columns to project at
 *   this level (`'*'` means all columns).
 * - Every other key is treated as a navigation property name whose value is
 *   a nested `ExpandTree` for that association.
 *
 * @property {ColumnProjection} [$columns]
 *   Columns to select at this entity level.
 *   Omit or set to `[]` to fall back entirely to whatever the client requested.
 *
 * @example
 * const purchaseReqTree = {
 *   $columns: ['purchaseRequisition', 'quantity', 'deliveryDate'],
 *   material: {
 *     $columns: ['material', 'materialType', 'baseUnit'],
 *   },
 *   plant: {
 *     $columns: '*',           // select everything on Plant
 *     country: {
 *       $columns: ['code', 'name'],
 *     },
 *   },
 * };
 */

/**
 * @typedef {Array<{ref: string[], expand?: Array}>} ODataColumnList
 * The internal OData / CDS representation of a column list, as found in
 * `req.query.SELECT.columns`. Each entry has a `ref` array (path segments)
 * and an optional `expand` array for navigation properties.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the names of simple (non-navigation) columns from an OData column
 * list. Navigation properties — identified by having more than one path
 * segment in their `ref` array — are ignored.
 *
 * @param {ODataColumnList | null | undefined} requestedColumns
 *   The raw column list from `req.query.SELECT.columns`, or `null`/`undefined`
 *   when the client sent no `$select`.
 *
 * @returns {string[]}
 *   An array of plain column names, e.g. `['purchaseRequisition', 'quantity']`.
 *   Returns an empty array when `requestedColumns` is falsy.
 *
 * @example
 * const cols = extractSimpleRequestedColumns(req.query.SELECT.columns);
 * // → ['purchaseRequisition', 'quantity']
 */
function extractSimpleRequestedColumns(requestedColumns) {
  if (!requestedColumns) return [];
  return requestedColumns
    .filter((col) => col.ref?.length === 1)
    .map((col) => col.ref[0]);
}

/**
 * Applies column projection to an entity navigation builder by merging the
 * tree's `$columns` declaration with whatever simple columns the client
 * explicitly requested via `$select`.
 *
 * Merge rules:
 * - If `$columns === '*'`  → call builder with `'*'` (select all; client
 *   columns are redundant).
 * - If `$columns` is an array → union of tree columns + client columns.
 * - If `$columns` is absent  → use only the client's columns (if any).
 *
 * @param {Function} entityNavigationBuilder
 *   The CDS column-builder callback for the current navigation level,
 *   e.g. the `m` in `.columns(m => { m.material(); m.baseUnit(); })`.
 *
 * @param {ExpandTree | undefined} expandTree
 *   The expand tree node for the current entity level. May be `undefined`
 *   when called recursively for a navigation that has no explicit tree entry.
 *
 * @param {ODataColumnList | undefined} requestedColumnsFromRequest
 *   The `$select` columns the client sent for this navigation level.
 *
 * @returns {void}
 */
function applyProjectionColumns(
  entityNavigationBuilder,
  expandTree,
  requestedColumnsFromRequest,
) {
  const treeProjectionColumns = expandTree?.$columns || [];

  // ── Case 1: wildcard — select everything ──────────────────
  if (treeProjectionColumns === '*') {
    entityNavigationBuilder('*');
    return;
  }

  // ── Case 2: explicit column list — merge with client $select ─
  if (Array.isArray(treeProjectionColumns)) {
    const mergedProjectionColumns = [
      ...new Set([
        ...treeProjectionColumns,
        ...extractSimpleRequestedColumns(requestedColumnsFromRequest),
      ]),
    ];

    if (mergedProjectionColumns.length) {
      entityNavigationBuilder(mergedProjectionColumns);
    }
    return;
  }

  // ── Case 3: no tree columns — use only what the client asked for ─
  const feSimpleColumns = extractSimpleRequestedColumns(
    requestedColumnsFromRequest,
  );
  if (feSimpleColumns.length) {
    entityNavigationBuilder(feSimpleColumns);
  }
}

/**
 * Finds the expand sub-list that the client requested for a specific
 * navigation property inside a parent `$select` / `$expand` column list.
 *
 * This is used to thread client-requested columns down into nested
 * navigation levels so that `buildExpand` can honour a deeply nested
 * `$select=material/baseUnit` alongside server-side tree defaults.
 *
 * @param {ODataColumnList | null | undefined} requestedColumns
 *   The column list at the *parent* entity level (i.e., the columns the
 *   client passed for the entity that owns `navigationPropertyName`).
 *
 * @param {string} navigationPropertyName
 *   The association name to look up, e.g. `'material'` or `'plant'`.
 *
 * @returns {ODataColumnList}
 *   The nested column list for that navigation property, or an empty array
 *   if the client did not request that navigation at all.
 *
 * @example
 * // req.query.SELECT.columns contains an expand for 'material'
 * const materialCols = extractRequestedNavExpandColumns(
 *   req.query.SELECT.columns,
 *   'material'
 * );
 * // → [{ ref: ['material'] }, { ref: ['baseUnit'] }]
 */
function extractRequestedNavExpandColumns(
  requestedColumns,
  navigationPropertyName,
) {
  if (!requestedColumns) return [];

  const navigationRequest = requestedColumns.find(
    (col) => col.ref && col.ref[0] === navigationPropertyName,
  );
  if (!navigationRequest?.expand) return [];

  return navigationRequest.expand;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a recursive CDS column-builder callback from a declarative expand
 * tree, merging server-defined projections with any columns the client
 * explicitly requested via `$select` / `$expand`.
 *
 * The returned function is passed directly to `SELECT.from().columns()` and
 * recursively handles nested associations by walking both the `expandTree`
 * and the client's `requestedColumnsFromRequest` in parallel.
 *
 * @param {ExpandTree} expandTree
 *   Declarative description of which associations to expand and which columns
 *   to project at each level. Navigation property keys map to nested
 *   `ExpandTree` nodes; the special `$columns` key controls scalar projection.
 *
 * @param {ODataColumnList} [requestedColumnsFromRequest=[]]
 *   The raw column list from `req.query.SELECT.columns` (or the equivalent
 *   nested expand list for a child navigation). Defaults to an empty array,
 *   meaning only the tree definition drives the projection.
 *
 * @returns {Function}
 *   A column-builder callback `(entityNavigationBuilder) => void` suitable
 *   for passing to `.columns()`.
 *
 * @example <caption>Flat expand — no client columns</caption>
 * const tree = {
 *   $columns: ['purchaseRequisition', 'quantity'],
 *   material: { $columns: ['material', 'baseUnit'] },
 *   plant:    { $columns: '*' },
 * };
 *
 * const rows = await SELECT.from(PurchaseRequisition)
 *   .columns(buildExpand(tree));
 *
 * @example <caption>Honouring client $select alongside tree defaults</caption>
 * const rows = await SELECT.from(PurchaseRequisition)
 *   .columns(buildExpand(tree, req.query.SELECT.columns));
 *
 * @example <caption>Nested associations</caption>
 * const deepTree = {
 *   $columns: ['purchaseRequisition'],
 *   plant: {
 *     $columns: ['plant', 'plantName'],
 *     country: {
 *       $columns: ['code', 'name'],
 *     },
 *   },
 * };
 *
 * const rows = await SELECT.from(PurchaseRequisition)
 *   .columns(buildExpand(deepTree, req.query.SELECT.columns));
 */
export function buildExpand(expandTree, requestedColumnsFromRequest = []) {
  /**
   * Inner callback handed to the CDS column builder at each entity level.
   *
   * @param {Function} entityNavigationBuilder
   *   The CDS builder proxy for the current navigation scope. Supports both
   *   direct invocation (`builder('col')`) for scalar columns and property
   *   access (`builder.navProp(cb)`) for nested navigations.
   */
  return function expandEntity(entityNavigationBuilder) {
    // 1. Project scalar columns at this level
    applyProjectionColumns(
      entityNavigationBuilder,
      expandTree,
      requestedColumnsFromRequest,
    );

    // 2. Recurse into each navigation property declared in the tree
    for (const navigationProperty in expandTree) {
      if (navigationProperty === '$columns') continue;

      const nestedExpandTree = expandTree[navigationProperty];

      // Thread any client-requested columns for this navigation downward
      const childRequestedColumns = extractRequestedNavExpandColumns(
        requestedColumnsFromRequest,
        navigationProperty,
      );

      entityNavigationBuilder[navigationProperty](
        buildExpand(nestedExpandTree, childRequestedColumns),
      );
    }
  };
}