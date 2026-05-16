import cds from "@sap/cds";
import { buildExpand } from "../../common/query/BuildExpand.js";
import { VendorMasterTree } from "../../common/query/Trees/Vendor/VendorMasterTree.js";

/**
 * Handles READ requests for VendorMaster.
 *
 * Uses `SELECT.from().columns()` driven by `VendorMasterTree` so that:
 *  - Server-defined projections are always present (supplier, supplierName, country, city, street, materialInfoRecords)
 *  - Any client `$select` / `$expand` columns are merged in via `buildExpand`
 *  - OData query options ($filter, $orderby, $top, $skip) are preserved
 *
 * @param {import('@sap/cds').Request} req  - CDS request context
 * @param {object} VendorMaster            - CDS entity from `this.entities`
 * @returns {Promise<object[]>}
 */
const onReadVendorMaster = async (req, VendorMaster) => {
  const query = SELECT.from(VendorMaster).columns(
    buildExpand(VendorMasterTree, req.query.SELECT.columns),
  );

  if (req.query.SELECT.where) query.where(req.query.SELECT.where);
  if (req.query.SELECT.orderBy) query.orderBy(req.query.SELECT.orderBy);
  if (req.query.SELECT.limit) query.limit(req.query.SELECT.limit);

  return cds.run(query);
};

export { onReadVendorMaster };
