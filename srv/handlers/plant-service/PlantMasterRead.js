import cds from "@sap/cds";
import { buildExpand } from "../common/query/BuildExpand";
import { PlantTree } from "../common/query/PlantTree";

/**
 * Handles READ requests for Plant.
 *
 * Uses `SELECT.from().columns()` driven by `PlantTree` so that:
 *  - Server-defined projections are always present (plant, name, city, country, storageLocations)
 *  - Any client `$select` / `$expand` columns are merged in via `buildExpand`
 *  - OData query options ($filter, $orderby, $top, $skip) are preserved
 *
 * @param {import('@sap/cds').Request} req  - CDS request context
 * @param {object} Plant                    - CDS entity from `this.entities`
 * @returns {Promise<object[]>}
 */
const onReadPlant = async (req, Plant) => {
  const query = SELECT.from(Plant).columns(
    buildExpand(PlantTree, req.query.SELECT.columns),
  );

  if (req.query.SELECT.where) query.where(req.query.SELECT.where);
  if (req.query.SELECT.orderBy) query.orderBy(req.query.SELECT.orderBy);
  if (req.query.SELECT.limit) query.limit(req.query.SELECT.limit);

  return cds.run(query);
};

export { onReadPlant };
