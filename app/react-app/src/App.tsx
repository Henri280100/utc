import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./AppShell";
import Dashboard from "./pages/Dashboard";
import MaterialMasterManagement from "./pages/master-management/MaterialMasterManagement";
import PlantManagement from "./pages/master-management/PlantManagement";
import VendorMasterManagement from "./pages/master-management/VendorMasterManagement";
import PurchasingOrganizationManagement from "./pages/master-management/PurchasingOrganizationManagement";
import PurchaseRequisitionManagement from "./pages/purchase-management/PurchaseRequisitionManagement";

const API_BASE = "http://localhost:4004";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard apiBase={API_BASE} />} />
          <Route
            path="material"
            element={
              <MaterialMasterManagement apiUrl={`${API_BASE}/material-masters`} />
            }
          />
          <Route
            path="plant"
            element={<PlantManagement apiUrl={`${API_BASE}/plant-masters`} />}
          />
          <Route
            path="vendor"
            element={
              <VendorMasterManagement apiUrl={`${API_BASE}/vendor-masters`} />
            }
          />
          <Route
            path="purchasing-org"
            element={
              <PurchasingOrganizationManagement
                apiUrl={`${API_BASE}/purchasing-organizations`}
              />
            }
          />
          <Route
            path="purchase"
            element={
              <PurchaseRequisitionManagement
                apiUrl={`${API_BASE}/purchase-requisitions`}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
