sap.ui.define(["sap/ui/core/mvc/Controller", "../models/formatter", "sap/m/MessageToast", "sap/f/library"], function (Controller, __formatter, MessageToast, fLibrary) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const formatter = _interopRequireDefault(__formatter);
  const DetailController = Controller.extend("webapp.controller.DetailController", {
    constructor: function constructor() {
      Controller.prototype.constructor.apply(this, arguments);
      this.formatter = formatter;
    },
    get layoutModel() {
      const ownerComponent = this.getOwnerComponent();
      if (!ownerComponent) {
        throw new Error("No owner component");
      }
      return ownerComponent.getModel("layout");
    },
    onInit: function _onInit() {
      const comp = this.getOwnerComponent();
      if (!comp) {
        throw new Error("No owner component");
      }
      this.oRouter = comp.getRouter(); // to focus button after layout change
      this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
      this.oRouter.getRoute("List").attachPatternMatched(this._onObjectMatched, this);
    },
    _onObjectMatched: function _onObjectMatched(oEvent) {
      const args = oEvent.getParameter("arguments") || {};
      const ctxPathEncoded = args.ctxPath || "";
      if (!ctxPathEncoded) return;

      // remember ctxPath for full/exit/close handlers
      this._ctxPathEncoded = ctxPathEncoded;
      const sPath = decodeURIComponent(ctxPathEncoded);
      this.oView.bindElement({
        model: "PurchaseRequisition",
        path: sPath,
        parameters: {
          // top-level PR fields only (no navs here)
          $select: ["purchaseRequisition", "purchaseReqnItem", "quantity", "baseUnit", "deliveryDate", "releaseStatus", "requisitionDate", "requisitioner", "storageLocation", "PurchaseRequisitionType"],
          $expand: {
            // PR → material (assoc, one)
            material: {
              $select: ["material", "materialType", "industrySector", "baseUnit", "creationDate"],
              $expand: {
                materialDescriptions: {
                  $select: ["language", "materialDescriptions"]
                }
              }
            },
            // PR → plant (assoc, one)
            plant: {
              $select: ["plant", "plantName", "city", "country"],
              $expand: {
                storageLocations: {
                  $select: ["storageLocation", "storageLocationDescription"]
                }
              }
            },
            // PR → PurchasingGroup (assoc, one)
            PurchasingGroup: {
              $select: ["purchasingGroup", "purchasingGroupDescription"]
            },
            // PR → accountAssignment (composition, to-many)
            accountAssignment: {
              $select: ["purchaseRequisition", "purchaseReqnItem", "acctAssignment", "acctAssignmentCategory", "glAccount", "costCenter", "order"]
            },
            // PR → purchasingInfoRecords (assoc, to-many via material)
            purchasingInfoRecords: {
              $select: ["purchasingInfoRecord"],
              $expand: {
                supplier: {
                  $select: ["supplier", "supplierName", "country", "city", "street"]
                }
                // add purchasingOrgData $select if you actually show it
              }
            }
          }
        }
      });
    },
    /* =========================
     * FCL layout handlers
     * ========================= */
    handleFullScreen: function _handleFullScreen() {
      const abi = this.layoutModel?.getProperty("/actionButtonsInfo/midColumn/fullScreen") || {};
      const nextLayout = abi?.midColumn?.fullScreen || fLibrary.LayoutType.MidColumnFullScreen;
      this.oRouter.navTo("detail", {
        ctxPath: this._ctxPathEncoded,
        // keep your ctxPath param
        layout: nextLayout
      });
    },
    handleExitFullScreen: function _handleExitFullScreen() {
      const abi = this.layoutModel?.getProperty("/actionButtonsInfo/midColumn/exitFullScreen") || {};
      const nextLayout = abi?.midColumn?.exitFullScreen || fLibrary.LayoutType.TwoColumnsMidExpanded;
      this.oRouter.navTo("detail", {
        ctxPath: this._ctxPathEncoded,
        layout: nextLayout
      });
    },
    handleClose: function _handleClose() {
      const abi = this.layoutModel?.getProperty("/actionButtonsInfo/midColumn/closeColumn") || {};
      const nextLayout = abi?.midColumn?.closeColumn || fLibrary.LayoutType.OneColumn;
      this.oRouter.navTo("List", {
        layout: nextLayout
      });
    },
    /* =========================
     * Optional action buttons
     * ========================= */
    onCancelButtonPress: function _onCancelButtonPress() {
      MessageToast.show("Cancel pressed");
    },
    onAcceptButtonPress: function _onAcceptButtonPress() {
      MessageToast.show("Accept pressed");
    }
  });
  return DetailController;
});
//# sourceMappingURL=Detail-dbg.controller.js.map
