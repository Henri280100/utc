import { buildExpand } from "../common/query/BuildExpand";
import { PurchaseRequisitionTree } from "../common/query/PurchaseRequisitionTree";

/**
 * Handles READ requests for PurchaseRequisition.
 *
 * Replaces the old `req.query.SELECT.expand` mutation with a proper
 * `SELECT.from().columns()` query so that:
 *  - Projections are driven by `PurchaseRequisitionTree` (server-defined shape)
 *  - Any client `$select` columns are merged in via `buildExpand`
 *  - OData query options ($filter, $orderby, $top, $skip) are preserved
 *
 * @param {import('@sap/cds').Request} req  - CDS request context
 * @param {object}  PurchaseRequisition     - CDS entity from `this.entities`
 * @returns {Promise<object[]>}
 */
const onReadPurchaseRequisition = async (req, PurchaseRequisition) => {
  const query = SELECT.from(PurchaseRequisition).columns(
    buildExpand(PurchaseRequisitionTree, req.query.SELECT.columns),
  );

  // Preserve OData query options the client sent
  if (req.query.SELECT.where) query.where(req.query.SELECT.where);
  if (req.query.SELECT.orderBy) query.orderBy(req.query.SELECT.orderBy);
  if (req.query.SELECT.limit) query.limit(req.query.SELECT.limit);

  return cds.run(query);
};
export { onReadPurchaseRequisition };
