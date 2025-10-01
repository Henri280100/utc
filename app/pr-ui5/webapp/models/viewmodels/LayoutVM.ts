import { UIState } from "sap/f/FlexibleColumnLayoutSemanticHelper";

export interface ColumnButtons {
  fullScreen: boolean;
  exitFullScreen: boolean;
  closeColumn: boolean;
}

export interface LayoutVM {
  layout: UIState["layout"];
  actionButtonsInfo: UIState["actionButtonsInfo"]
  busy?: boolean;
  routeName?: string;
  routeParams?: Record<string, string>;
}
