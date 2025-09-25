// webapp/controller/App.controller.ts
import Controller from "sap/ui/core/mvc/Controller";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import * as fLibrary from "sap/f/library";
import Event from "sap/ui/base/Event";
import Router from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";

type LayoutType = fLibrary.LayoutType;

export default class AppController extends Controller {
  /** Controls & helpers */
  private _oFCL!: FlexibleColumnLayout;
  private _fclHelper!: FlexibleColumnLayoutSemanticHelper;

  /** App-wide layout model (default unnamed JSONModel on Component) */
  private oLayoutModel!: JSONModel;

  /** Router + current route state */
  private oRouter!: Router;
  private _currentRouteName = "";
  private _currentArgs: Record<string, any> = {};

  /** Bound handlers so we can detach on exit */
  private _onRouteMatchedBound!: (e: Event) => void;
  private _onFclStateChangeBound!: (e: Event) => void;

  public onInit(): void {
    // Router & layout model from Component
    const comp = this.getOwnerComponent() as UIComponent | undefined;
    if (!comp) throw new Error("No owner component");

    this.oRouter = comp.getRouter();
    this.oLayoutModel = comp.getModel() as JSONModel; // default model provided in Component

    // FCL control + helper
    this._oFCL = this.byId("idFlexibleColumnLayout") as FlexibleColumnLayout;
    const settings = {
      defaultTwoColumnLayoutType: fLibrary.LayoutType.TwoColumnsMidExpanded as LayoutType,
      defaultThreeColumnLayoutType: fLibrary.LayoutType.ThreeColumnsMidExpanded as LayoutType
    };
    this._fclHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(
      this._oFCL,
      settings
    );

    // Initial UI state
    this._updateUIState();

    // Attach handlers (keep references to detach later)
    this._onFclStateChangeBound = this.onFlexibleColumnLayoutStateChange.bind(this);
    this._oFCL.attachStateChange(this._onFclStateChangeBound);

    this._onRouteMatchedBound = this.onRouteMatched.bind(this);
    this.oRouter.attachRouteMatched(this._onRouteMatchedBound);
  }

  /** Compute & write current UI state into the shared layout model */
  private _updateUIState(): void {
    const uiState = this._fclHelper.getCurrentUIState();
    this.oLayoutModel.setProperty("/layout", uiState.layout);
    this.oLayoutModel.setProperty("/actionButtonsInfo", uiState.actionButtonsInfo);
  }

  /** Remember route + args for arrow navigation */
  public onRouteMatched(oEvent: Event): void {
    this._currentRouteName = (oEvent.getParameter("name") as string) || "";
    this._currentArgs = (oEvent.getParameter("arguments") as Record<string, any>) || {};
  }

  /** When user clicks FCL arrows, keep model in sync and re-nav with new layout */
  public onFlexibleColumnLayoutStateChange(oEvent: Event): void {
    const bArrow = !!oEvent.getParameter("isNavigationArrow");
    const sLayout = oEvent.getParameter("layout") as LayoutType;
    const oABI = oEvent.getParameter("actionButtonsInfo") as Record<string, any>;

    // keep model in sync (used by buttons’ visibility + handlers)
    this.oLayoutModel.setProperty("/layout", sLayout);
    this.oLayoutModel.setProperty("/actionButtonsInfo", oABI);

    // if user clicked an arrow, re-nav to the same route with the new layout
    if (bArrow && this._currentRouteName) {
      const mNav = { ...this._currentArgs, layout: sLayout };
      this.oRouter.navTo(this._currentRouteName, mNav, true); // replace hash
    }
  }

  /** Clean up */
  public onExit(): void {
    if (this._oFCL && this._onFclStateChangeBound) {
      this._oFCL.detachStateChange(this._onFclStateChangeBound);
    }
    if (this.oRouter && this._onRouteMatchedBound) {
      this.oRouter.detachRouteMatched(this._onRouteMatchedBound, this);
    }
  }
}
