
/**
 * @typedef {import('../BuildExpand').ExpandTree} ExpandTree
 */

/**
 * PurchasingOrganizationTree
 * --------------------------
 * Declarative expand tree for PurchasingOrganizationData queries.
 * Consumed by `buildExpand(PurchasingOrganizationTree, req.query.SELECT.columns)`.
 *
 * Shape mirrors:
 *   SELECT.from(PurchasingOrganizationData)
 *     .columns(q => {
 *       q.purchasingOrganization();
 *       q.purchasingInfoRecord();
 *       q.netPrice();
 *       q.priceUnit();
 *       q.infoRecords(ir => { ir.purchasingInfoRecord(); ir.material_material(); ir.supplier_supplier(); });
 *     });
 *
 * @type {ExpandTree}
 */
export const PurchasingOrganizationTree = {
  $columns: ["purchasingOrganization", "purchasingInfoRecord", "netPrice", "priceUnit"],

  infoRecords: {
    $columns: ["purchasingInfoRecord", "material_material", "supplier_supplier"],
  },
};
