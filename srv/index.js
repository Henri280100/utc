// Add module handler and export
import purchaseServiceHandler from "./requisition-service/index.js";
import plantServiceHandler from "./plant-service/index.js";
import materialServiceHandler from "./material-service/index.js";

const modules = [
  purchaseServiceHandler,
  plantServiceHandler,
  materialServiceHandler,
];

export default function (service) {
  for (const init of modules) {
    init(service);
  }
}
