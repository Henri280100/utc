import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './AppShell';
import Dashboard from './pages/Dashboard';
import MaterialMasterManagement from './pages/master-management/MaterialMasterManagement';
import PlantManagement from './pages/master-management/PlantManagement';
import PurchaseRequisitionManagement from './pages/purchase-management/PurchaseRequisitionManagement';

const API_BASE = 'http://localhost:5173/odata/v4';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard apiBase={API_BASE} />} />
          <Route path="material" element={<MaterialMasterManagement apiUrl={`${API_BASE}/master-data`} />} />
          <Route path="plant"    element={<PlantManagement          apiUrl={`${API_BASE}/plant`} />} />
          <Route path="purchase" element={<PurchaseRequisitionManagement apiUrl={`${API_BASE}/purchase-requisitions`} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}