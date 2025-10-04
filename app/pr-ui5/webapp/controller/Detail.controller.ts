import { UIState } from "sap/f/FlexibleColumnLayoutSemanticHelper";
import * as fLibrary from "sap/f/library";
import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import { Route$BeforeMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import { bindPRDetail } from "../bindings";
import formatter from "../models/formatter";
import { LayoutVM } from "../models/viewmodels";
import { attachPatternMatchedRoutes } from "../routing";

export default class DetailController extends Controller {
  private oRouter!: Router;
  private _ctxPathEncoded!: string;

  private layoutModel(): TypedJSONModel<LayoutVM> {
    const ownerComponent = this.getOwnerComponent();
    if (!ownerComponent) {
      throw new Error("No owner component");
    }
    return ownerComponent.getModel("layout") as TypedJSONModel<LayoutVM>;
  }

  public formatter = formatter;
  public onInit(): void {
    const { router } = attachPatternMatchedRoutes(
      this,
      ["List", "detail"],
      this._onObjectMatched
    );
    this.oRouter = router;
  }

  private _onObjectMatched(oEvent: Route$BeforeMatchedEvent) {
    const args =
      (oEvent.getParameter("arguments") as Record<string, string>) || {};
    const ctxPathEncoded = args.ctxPath || "";
    if (!ctxPathEncoded) return;

    // remember ctxPath for full/exit/close handlers
    this._ctxPathEncoded = ctxPathEncoded;

    const sPath = decodeURIComponent(ctxPathEncoded);

    bindPRDetail(this.getView(), sPath);
  }

  /* =========================
   * FCL layout handlers
   * ========================= */

  handleFullScreen(): void {
    const nextLayout =
      (this.layoutModel()?.getProperty(
        "/actionButtonsInfo/midColumn/fullScreen"
      ) as UIState["layout"]) ?? fLibrary.LayoutType.MidColumnFullScreen;

    this.oRouter.navTo("detail", {
      ctxPath: this._ctxPathEncoded, // keep your ctxPath param
      layout: nextLayout,
    });
  }

  handleExitFullScreen(): void {
    const nextLayout =
      (this.layoutModel()?.getProperty(
        "/actionButtonsInfo/midColumn/exitFullScreen"
      ) as UIState["layout"]) ?? fLibrary.LayoutType.TwoColumnsMidExpanded;

    this.oRouter.navTo("detail", {
      ctxPath: this._ctxPathEncoded,
      layout: nextLayout,
    });
  }

  handleClose(): void {
    const nextLayout =
      (this.layoutModel()?.getProperty(
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
