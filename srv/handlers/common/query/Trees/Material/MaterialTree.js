
/**
 * @typedef {import('../BuildExpand').ExpandTree} ExpandTree
 */

/**
 * MaterialMasterTree
 * ------------------
 * Declarative expand tree for MaterialMaster queries.
 * Consumed by `buildExpand(MaterialMasterTree, req.query.SELECT.columns)`.
 *
 * Shape mirrors:
 *   SELECT.from(MaterialMaster)
 *     .columns(q => {
 *       q.material();
 *       q.materialType();
 *       q.industrySector();
 *       q.baseUnit();
 *       q.creationDate();
 *       q.materialGroup(mg => { mg.materialGroup(); mg.materialGroupDescription(); });
 *       q.materialDescriptions(md => { md.language(); md.materialDescription(); });
 *       q.plantData(pd => { pd.material(); pd.plant(); });
 *     });
 *
 * @type {ExpandTree}
 */
export const MaterialMasterTree = {
  $columns: [
    "material",
    "materialType",
    "industrySector",
    "baseUnit",
    "creationDate",
  ],

  materialGroup: {
    $columns: ["materialGroup", "materialGroupDescription"],
  },

  materialDescriptions: {
    $columns: ["language", "materialDescription"],
  },

  plantData: {
    $columns: ["material", "plant"],
  },
};
