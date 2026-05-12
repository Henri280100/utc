// srv/handlers/index.js
import commonHandlers from "./common/index.js";
import purchaseServiceHandler from "./requisition-service/index.js";
import plantServiceHandler from "./plant-service/index.js";
import materialServiceHandler from "./material-service/index.js";

export default function (service) {
  //  Always apply common handlers
  commonHandlers(service);

  //  Apply specific handlers based on service name
  switch (service.name) {
    case 'PurchaseRequisitionsService':
      purchaseServiceHandler(service);
      break;
    case 'MasterDataService':
      materialServiceHandler(service);
      break;
    case 'PlantService':
      plantServiceHandler(service);
      break;
  }
}