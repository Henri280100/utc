import { UIState } from "sap/f/FlexibleColumnLayoutSemanticHelper";
import * as fLibrary from "sap/f/library";
import MessageToast from "sap/m/MessageToast";
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import { Route$BeforeMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import { LayoutVM } from "webapp/models/viewmodels";
import formatter from "../models/formatter";

export default class DetailController extends Controller {
  private oRouter!: Router;
  private _ctxPathEncoded!: string;
  private oView!: View;

  private layoutModel(): TypedJSONModel<LayoutVM> {
    const ownerComponent = this.getOwnerComponent();
    if (!ownerComponent) {
      throw new Error("No owner component");
    }
    return ownerComponent.getModel("layout") as TypedJSONModel<LayoutVM>;
  }

  public formatter = formatter;
  public onInit(): void {
    const comp = this.getOwnerComponent() as UIComponent | undefined;
    if (!comp) {
      throw new Error("No owner component");
    }
    this.oRouter = comp.getRouter(); // to focus button after layout change
    this.oRouter
      .getRoute("detail")!
      .attachPatternMatched(this._onObjectMatched, this);
    this.oRouter
      .getRoute("List")!
      .attachPatternMatched(this._onObjectMatched, this);
  }

  private _onObjectMatched(oEvent: Route$BeforeMatchedEvent) {
    const args =
      (oEvent.getParameter("arguments") as Record<string, string>) || {};
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
  }

  /* =========================
   * FCL layout handlers
   * ========================= */

  handleFullScreen(): void {
    const nextLayout =
      (this.layoutModel().getProperty(
        "/actionButtonsInfo/midColumn/fullScreen"
      ) as UIState["layout"]) ?? fLibrary.LayoutType.MidColumnFullScreen;

    this.oRouter.navTo("detail", {
      ctxPath: this._ctxPathEncoded, // keep your ctxPath param
      layout: nextLayout,
    });
  }

  handleExitFullScreen(): void {
    const nextLayout =
      (this.layoutModel().getProperty(
        "/actionButtonsInfo/midColumn/exitFullScreen"
      ) as UIState["layout"]) ?? fLibrary.LayoutType.TwoColumnsMidExpanded;

    this.oRouter.navTo("detail", {
      ctxPath: this._ctxPathEncoded,
      layout: nextLayout,
    });
  }

  handleClose(): void {
    const nextLayout =
      (this.layoutModel().getProperty(
        "/actionButtonsInfo/midColumn/closeColumn"
      ) as UIState["layout"]) ?? fLibrary.LayoutType.OneColumn;

    this.oRouter.navTo("List", { layout: nextLayout });
  }

  /* =========================
   * Optional action buttons
   * ========================= */
  public onCancelButtonPress(): void {
    MessageToast.show("Cancel pressed");
  }

  public onAcceptButtonPress(): void {
    MessageToast.show("Accept pressed");
  }
}
