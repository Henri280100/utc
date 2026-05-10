import cds from "@sap/cds";
import { buildExpand } from "../common/query/BuildExpand.js";
import { MaterialMasterTree } from "../common/query/Trees/Material/MaterialTree.js";

/**
 * Handles READ requests for MaterialMaster.
 *
 * Uses `SELECT.from().columns()` driven by `MaterialMasterTree` so that:
 *  - Server-defined projections are always present (material, type, descriptions, etc.)
 *  - Any client `$select` / `$expand` columns are merged in via `buildExpand`
 *  - OData query options ($filter, $orderby, $top, $skip) are preserved
 *
 * @param {import('@sap/cds').Request} req  - CDS request context
 * @param {object} MaterialMaster           - CDS entity from `this.entities`
 * @returns {Promise<object[]>}
 */
const onReadMaterialMaster = async (req, MaterialMaster) => {
  const query = SELECT.from(MaterialMaster).columns(
    buildExpand(MaterialMasterTree, req.query.SELECT.columns),
  );

  if (req.query.SELECT.where) query.where(req.query.SELECT.where);
  if (req.query.SELECT.orderBy) query.orderBy(req.query.SELECT.orderBy);
  if (req.query.SELECT.limit) query.limit(req.query.SELECT.limit);

  return cds.run(query);
};

export { onReadMaterialMaster };
