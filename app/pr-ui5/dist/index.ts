// index.ts
import ComponentContainer from "sap/ui/core/ComponentContainer";


new ComponentContainer({
  manifest: true,
  name: "sap.ui.prui5",          // UI5 will construct your app component
  height: "100%",
  async: true
}).placeAt("content");
