import ComponentContainer from "sap/ui/core/ComponentContainer";

new ComponentContainer({
  id: "container",
  name: "sap.ui.prui5",
  settings: {
    id: "prui5",
    
  },
  async: true,
}).placeAt("content");
