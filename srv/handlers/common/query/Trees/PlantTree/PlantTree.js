
/**
 * @typedef {import('../BuildExpand').ExpandTree} ExpandTree
 */

/**
 * PlantTree
 * ---------
 * Declarative expand tree for Plant queries.
 * Consumed by `buildExpand(PlantTree, req.query.SELECT.columns)`.
 *
 * Shape mirrors:
 *   SELECT.from(Plant)
 *     .columns(q => {
 *       q.plant();
 *       q.plantName();
 *       q.city();
 *       q.country(c => { c.code(); c.name(); });
 *       q.storageLocations(sl => { sl.storageLocation(); sl.storageLocationName(); });
 *     });
 *
 * @type {ExpandTree}
 */
export const PlantTree = {
  $columns: ["plant", "plantName", "city"],

  country: {
    $columns: ["code", "name"],
  },

  storageLocations: {
    $columns: ["storageLocation", "storageLocationName"],
  },
};
