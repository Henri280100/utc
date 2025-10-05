import Control from "sap/ui/core/Control";
import Controller from "sap/ui/core/mvc/Controller";
import { GenericVHConfig } from "../../types/GenericVHConfig.types";
import Fragment from "sap/ui/core/Fragment";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";

export async function openValueHelp(
  controller: Controller,
  config: GenericVHConfig,
  multipleInputId: string,
  fragmentName = "sap.ui.prui5.view.fragment.GenericVHDialog",
  fragmentIdPrefix = "GEN_VH"
): Promise<void> {
  const view = controller.getView();
  const fragId =
    (controller as Controller).createId?.(
      `${fragmentIdPrefix}_${Date.now()}`
    ) || `${fragmentIdPrefix}_${Date.now()}`;

  await Fragment.load({
    id: fragId,
    name: fragmentName,
    controller,
  });

  const valueHelpDialog = Fragment.byId(
    fragId,
    "idSmartFilterBar"
  ) as ValueHelpDialog;
  const filterBar = Fragment.byId(fragId, "vhdFilterBar") as FilterBar;
  view.addDependent(valueHelpDialog);
  
  // dialog basics
  valueHelpDialog.setTitle(valueHelpDialog.getTitle() || "Select");
  valueHelpDialog.setSupportMultiselect(!!config.multi);
  valueHelpDialog.setSupportRanges(false);
  valueHelpDialog.setKey(config.keyPath);
  if (config.textPath) valueHelpDialog.setDescriptionKey(config.textPath);
  valueHelpDialog.setBasicSearchText("");

  filterBar.setUseToolbar(true);
  (filterBar as FilterBar).setShowGoOnFB(true);
  (filterBar as FilterBar).setShowClearOnFB(true);
  (filterBar as FilterBar).setShowFilterConfiguration(true);
  (filterBar as FilterBar).setFilterBarExpanded(true);

  // Basic Search field (with OR without suggestions)
  const searchField =


}
