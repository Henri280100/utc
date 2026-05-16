
/**
 * @typedef {import('../BuildExpand').ExpandTree} ExpandTree
 */

/**
 * PurchaseRequisitionTree
 * -----------------------
 * Declarative expand tree for PurchaseRequisition queries.
 * Consumed by `buildExpand(PurchaseRequisitionTree, req.query.SELECT.columns)`.
 *
 * Shape mirrors the intended SELECT.from().columns() structure:
 *
 *   SELECT.from(PurchaseRequisition)
 *     .columns(q => {
 *       q.purchaseRequisition();
 *       q.purchaseReqnItem();
 *       q.material(m => { m.material(); m.materialType(); });
 *       q.plant(p => { p.plant(); p.plantName(); });
 *       q.PurchasingGroup(pg => { pg.purchasingGroup(); pg.purchasingGroupDescription(); });
 *     });
 *
 * @type {ExpandTree}
 */
export const PurchaseRequisitionTree = {
  $columns: [
    'purchaseRequisition',
    'purchaseReqnItem',
  ],

  material: {
    $columns: [
      'material',
      'materialType',
    ],
  },

  plant: {
    $columns: [
      'plant',
      'plantName',
    ],
  },

  PurchasingGroup: {
    $columns: [
      'purchasingGroup',
      'purchasingGroupDescription',
    ],
  },
};