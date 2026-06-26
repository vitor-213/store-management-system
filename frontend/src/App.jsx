import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import InventoryMovements from "./pages/inventory/InventoryMovements";
import InventoryAlerts from "./pages/inventory/InventoryAlerts";
import SalesList from "./pages/sales/SalesList";
import SaleDetail from "./pages/sales/SaleDetail";
import SaleStats from "./pages/sales/SaleStats";
import POS from "./pages/pos/POS";

// En el DashboardLayout, agrega:
<Route path="/pos" element={<POS />} />;

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/pos" element={<POS />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryMovements />} />
              <Route path="/inventory/alerts" element={<InventoryAlerts />} />
              <Route path="/sales" element={<SalesList />} />
              <Route path="/sales/:id" element={<SaleDetail />} />
              <Route path="/sales/stats" element={<SaleStats />} />
              {/* Products */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              {/* Placeholders */}
              <Route
                path="/sales"
                element={
                  <div className="text-gray-500">Ventas - Próximamente</div>
                }
              />
              <Route
                path="/inventory"
                element={
                  <div className="text-gray-500">Inventario - Próximamente</div>
                }
              />
              <Route
                path="/users"
                element={
                  <div className="text-gray-500">Usuarios - Próximamente</div>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
