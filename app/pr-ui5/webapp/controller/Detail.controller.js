sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/prui5/models/formatter",
  ],
  function (Controller, MessageToast, formatter) {
    "use strict";

    return Controller.extend("sap.ui.prui5.controller.Detail", {
      formatter: formatter,
      onInit: function () {
        var oExitButton = this.getView().byId(
            "idExitFullScreenOverflowToolbarButton"
          ),
          oEnterButton = this.getView().byId(
            "idEnterFullScreenOverflowToolbarButton"
          );
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oLayoutModel = this.getOwnerComponent().getModel(); // holds /layout + /actionButtonsInfo

        this.oRouter
          .getRoute("detail")
          .attachPatternMatched(this._onObjectMatched, this);
        this.oRouter
          .getRoute("List")
          .attachPatternMatched(this._onObjectMatched, this);

        [oExitButton, oEnterButton].forEach(function (oButton) {
          oButton.addEventDelegate({
            onAfterRendering: function () {
              if (this.bFocusFullScreenButton) {
                this.bFocusFullScreenButton = false;
                oButton.focus();
              }
            }.bind(this),
          });
        }, this);
      },

      _onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter("arguments") || {};
        const ctxPathEncoded = args.ctxPath || "";
        if (!ctxPathEncoded) return;

        // remember ctxPath for full/exit/close handlers
        this._ctxPathEncoded = ctxPathEncoded;

        const sPath = decodeURIComponent(ctxPathEncoded);

        this.getView().bindElement({
          model: "PurchaseRequisition",
          path: sPath,
          parameters: {
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
                    $select: [
                      "supplier",
                      "supplierName",
                      "country",
                      "city",
                      "street",
                    ],
                  },
                  // add purchasingOrgData $select if you actually show it
                },
              },
            },
          },
          events: {
            dataRequested: () => {
              // optional: this.getView().setBusy(true);
            },
            dataReceived: () => {
              // optional: this.getView().setBusy(false);
            },
          },
        });
      },

      /* =========================
       * FCL layout handlers
       * ========================= */

      _navWithLayout: function (sRoute, sLayout, mExtras) {
        const params = Object.assign({}, mExtras);
        if (this._ctxPathEncoded) {
          params.ctxPath = this._ctxPathEncoded;
        }
        if (sLayout) {
          params.layout = sLayout;
        }
        this.oRouter.navTo(sRoute, params);
      },

      handleFullScreen: function () {
        const abi = this.oLayoutModel.getProperty("/actionButtonsInfo");
        const sNextLayout = abi && abi.midColumn && abi.midColumn.fullScreen;
        this._navWithLayout("detail", sNextLayout, {}); // stay on detail, keep ctxPath
      },

      handleExitFullScreen: function () {
        const abi = this.oLayoutModel.getProperty("/actionButtonsInfo");
        const sNextLayout =
          abi && abi.midColumn && abi.midColumn.exitFullScreen;
        this._navWithLayout("detail", sNextLayout, {}); // stay on detail, keep ctxPath
      },

      handleClose: function () {
        const abi = this.oLayoutModel.getProperty("/actionButtonsInfo");
        const sNextLayout = abi && abi.midColumn && abi.midColumn.closeColumn;
        // go back to list; layout switches to the one suggested by FCL
        this._navWithLayout("List", sNextLayout, {});
      },

      /* =========================
       * Optional action buttons
       * ========================= */
      onCancelButtonPress: function () {
        MessageToast.show("Cancel pressed");
      },

      onAcceptButtonPress: function () {
        MessageToast.show("Accept pressed");
      },
    });
  }
);
