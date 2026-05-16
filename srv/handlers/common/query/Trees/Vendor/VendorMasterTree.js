
/**
 * @typedef {import('../BuildExpand').ExpandTree} ExpandTree
 */

/**
 * VendorMasterTree
 * ----------------
 * Declarative expand tree for VendorMaster queries.
 * Consumed by `buildExpand(VendorMasterTree, req.query.SELECT.columns)`.
 *
 * Shape mirrors:
 *   SELECT.from(VendorMaster)
 *     .columns(q => {
 *       q.supplier();
 *       q.supplierName();
 *       q.country(c => { c.code(); c.name(); });
 *       q.city();
 *       q.street();
 *       q.materialInfoRecords(mr => { mr.purchasingInfoRecord(); mr.material_material(); });
 *     });
 *
 * @type {ExpandTree}
 */
export const VendorMasterTree = {
  $columns: ["supplier", "supplierName", "city", "street"],

  country: {
    $columns: ["code", "name"],
  },

  materialInfoRecords: {
    $columns: ["purchasingInfoRecord", "material_material", "supplier_supplier"],
  },
};
