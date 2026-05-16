import cds from "@sap/cds";
import { buildExpand } from "../../common/query/BuildExpand.js";
import { PurchasingOrganizationTree } from "../../common/query/Trees/PurchasingOrg/PurchasingOrganizationTree.js";

/**
 * Handles READ requests for PurchasingOrganizationData.
 *
 * Uses `SELECT.from().columns()` driven by `PurchasingOrganizationTree` so that:
 *  - Server-defined projections are always present (purchasingOrganization, purchasingInfoRecord, netPrice, priceUnit)
 *  - Any client `$select` / `$expand` columns are merged in via `buildExpand`
 *  - OData query options ($filter, $orderby, $top, $skip) are preserved
 *
 * @param {import('@sap/cds').Request} req  - CDS request context
 * @param {object} PurchasingOrganizationData - CDS entity from `this.entities`
 * @returns {Promise<object[]>}
 */
const onReadPurchasingOrganization = async (req, PurchasingOrganizationData) => {
  const query = SELECT.from(PurchasingOrganizationData).columns(
    buildExpand(PurchasingOrganizationTree, req.query.SELECT.columns),
  );

  if (req.query.SELECT.where) query.where(req.query.SELECT.where);
  if (req.query.SELECT.orderBy) query.orderBy(req.query.SELECT.orderBy);
  if (req.query.SELECT.limit) query.limit(req.query.SELECT.limit);

  return cds.run(query);
};

export { onReadPurchasingOrganization };
