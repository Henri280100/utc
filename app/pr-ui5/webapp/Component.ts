// webapp/Component.ts
import * as fLibrary from "sap/f/library";
import Event from "sap/ui/base/Event";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import TypedJSONModel from "sap/ui/model/json/TypedJSONModel";
import { LayoutVM } from "./models/viewmodels";

type LayoutType = fLibrary.LayoutType;

/**
 * @namespace sap.ui.prui5
 */
export default class Component extends UIComponent {
  public static metadata = {
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
    manifest: "json",
  };

  /** default/unnamed model → {/layout}, {/actionButtonsInfo} */
  private _oLayoutModel!: TypedJSONModel<LayoutVM>;
  private _currentRouteName?: string;
  private _currentArgs: Record<string, any> = {};

  // keep bound refs so we can detach later
  private _onBeforeRouteMatchedBound!: (e: Event) => void;
  private _onRouteMatchedBound!: (e: Event) => void;

  public init(): void {
    super.init();

    this._oLayoutModel = new TypedJSONModel<LayoutVM>({
      layout: fLibrary.LayoutType.OneColumn as LayoutType,
      actionButtonsInfo: {},
      busy: false,
    });
    this.setModel(this._oLayoutModel); // unnamed default model

    const oRouter: Router = this.getRouter();

    this._onBeforeRouteMatchedBound = this._onBeforeRouteMatched.bind(this);
    this._onRouteMatchedBound = this._onRouteMatched.bind(this);

    oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatchedBound);
    oRouter.attachRouteMatched(this._onRouteMatchedBound);
    oRouter.initialize();
  }

  /** Keep /layout aligned with route arg or fallback */
  private _onBeforeRouteMatched(oEvent: Route$PatternMatchedEvent): void {
    const args =
      (oEvent.getParameter("arguments") as Record<string, string>) || {};
    const current = this._oLayoutModel.getProperty("/layout") as LayoutType;
    const next: LayoutType =
      (args.layout as LayoutType) || current || fLibrary.LayoutType.OneColumn;

    if (current !== next) {
      this._oLayoutModel.setProperty("/layout", next);
    }
  }

  /** Remember route + args for arrow navigation updates */
  private _onRouteMatched(oEvent: Route$PatternMatchedEvent): void {
    this._currentRouteName = oEvent.getParameter("name") as string | undefined;
    this._currentArgs =
      (oEvent.getParameter("arguments") as Record<string, any>) || {};
  }

  /** Small helpers (optional) */
  public getLayoutModel(): TypedJSONModel<LayoutVM> {
    return this._oLayoutModel;
  }

  public getCurrentRouteInfo(): { name?: string; args: Record<string, any> } {
    return { name: this._currentRouteName, args: this._currentArgs };
  }

  public destroy(...args: unknown[]): void {
    const oRouter: Router = this.getRouter();
    if (this._onBeforeRouteMatchedBound) {
      oRouter.detachBeforeRouteMatched(this._onBeforeRouteMatchedBound, this);
    }
    if (this._onRouteMatchedBound) {
      oRouter.detachRouteMatched(this._onRouteMatchedBound, this);
    }
    super.destroy(...(args as []));
  }
}
