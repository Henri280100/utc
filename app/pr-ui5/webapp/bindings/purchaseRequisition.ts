import View from "sap/ui/core/mvc/View";

export const PR_DETAIL_BINDING_PARAMS = {
  // top-level PR fields only (no navs here)
  $select: [
    "purchaseRequisition",
    "purchaseReqnItem",
    "quantity",
    "baseUnit",
    "deliveryDate",
    "releaseStatus",
    "requisitionDate",
    "requisitioner",
    "storageLocation",
    "PurchaseRequisitionType",
  ],
  $expand: {
    // PR → material (assoc, one)
    material: {
      $select: [
        "material",
        "materialType",
        "industrySector",
        "baseUnit",
        "creationDate",
      ],
      $expand: {
        materialDescriptions: {
          $select: ["language", "materialDescriptions"],
        },
      },
    },
    // PR → plant (assoc, one)
    plant: {
      $select: ["plant", "plantName", "city", "country"],
      $expand: {
        storageLocations: {
          $select: ["storageLocation", "storageLocationDescription"],
        },
      },
    },
    // PR → PurchasingGroup (assoc, one)
    PurchasingGroup: {
      $select: ["purchasingGroup", "purchasingGroupDescription"],
    },
    // PR → accountAssignment (composition, to-many)
    accountAssignment: {
      $select: [
        "purchaseRequisition",
        "purchaseReqnItem",
        "acctAssignment",
        "acctAssignmentCategory",
        "glAccount",
        "costCenter",
        "order",
      ],
    },
    // PR → purchasingInfoRecords (assoc, to-many via material)
    purchasingInfoRecords: {
      $select: ["purchasingInfoRecord"],
      $expand: {
        supplier: {
          $select: ["supplier", "supplierName", "country", "city", "street"],
        },
        // add purchasingOrgData $select if you actually show it
      },
    },
  },
} as const;

/**
 * Bind Purchase Requisition detail view to a path.
 * The view is bound to the ODataModel using the parameters
 * defined in PR_DETAIL_BINDING_PARAMS.
 * @param {sap.ui.core.View} view - the view to bind
 * @param {string} path - the path to bind to
 */
export function bindPRDetail(view: View, path: string): void {
  const params = structuredClone(PR_DETAIL_BINDING_PARAMS); // Clone object
  view.bindElement({ model: "PurchaseRequisition", path, parameters: params });
}
