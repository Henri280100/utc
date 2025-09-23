sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/prui5/models/formatter",
    "sap/f/library",
  ],
  function (Controller, MessageToast, formatter, fLibrary) {
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

        this._ctxPathEncoded = "";
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
        });
      },

      /* =========================
       * FCL layout handlers
       * ========================= */

      handleFullScreen: function () {
        const abi =
          this.getOwnerComponent()
            .getModel()
            .getProperty("/actionButtonsInfo") || {};
        const nextLayout =
          abi?.midColumn?.fullScreen || sap.f.LayoutType.MidColumnFullScreen;

        this.oRouter.navTo("detail", {
          ctxPath: this._ctxPathEncoded, // keep your ctxPath param
          layout: nextLayout,
        });
      },

      handleExitFullScreen: function () {
        const abi =
          this.getOwnerComponent()
            .getModel()
            .getProperty("/actionButtonsInfo") || {};
        const nextLayout =
          abi?.midColumn?.exitFullScreen ||
          fLibrary.LayoutType.TwoColumnsMidExpanded;

        this.oRouter.navTo("detail", {
          ctxPath: this._ctxPathEncoded,
          layout: nextLayout,
        });
      },

      handleClose: function () {
        const abi =
          this.getOwnerComponent()
            .getModel()
            .getProperty("/actionButtonsInfo") || {};
        const nextLayout =
          abi?.midColumn?.closeColumn || fLibrary.LayoutType.OneColumn;

        this.oRouter.navTo("List", { layout: nextLayout });
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
