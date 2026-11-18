
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import MedicinesPage from "./pages/MedicinesPage";
import SuppliersPage from "./pages/SuppliersPage";
import InventoryPage from "./pages/InventoryPage";
import MedicineDetailsPage from "./pages/MedicineDetailsPage";
import PurchasesPage from "./pages/PurchasesPage";
import FindMedicine from "./pages/FindMedicine";
import NewSale from "./pages/NewSale";
import SalesPage from "./pages/SalesPage";
import SaleDetails from "./pages/SaleDetails";
import ExpiryPage from "./pages/ExpiryPage";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="find-medicine" element={<FindMedicine />} />

            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/new" element={<NewSale />} />
            <Route path="sales/:id" element={<SaleDetails />} />

            <Route
              path="medicines/:id/details"
              element={<MedicineDetailsPage />}
            />
            <Route path="medicines" element={<MedicinesPage />} />

            <Route path="inventory" element={<InventoryPage />} />

            <Route
              path="purchases"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <PurchasesPage />
                </ProtectedRoute>
              }
            />

            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="expiry" element={<ExpiryPage />} />

            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
