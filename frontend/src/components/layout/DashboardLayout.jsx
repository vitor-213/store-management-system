import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiAlertTriangle,
  FiTrendingUp, // ✅ Agregar esta importación
} from "react-icons/fi";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  const navItems = [
    { icon: FiShoppingCart, label: "POS", path: "/pos" },
    { icon: FiHome, label: "Dashboard", path: "/" },
    { icon: FiPackage, label: "Productos", path: "/products" },
    { icon: FiShoppingCart, label: "Ventas", path: "/sales" },
    { icon: FiBarChart2, label: "Movimientos", path: "/inventory" },
    { icon: FiAlertTriangle, label: "Alertas", path: "/inventory/alerts" },
    ...(user?.role === "admin" || user?.role === "manager"
      ? [
          { icon: FiUsers, label: "Usuarios", path: "/users" },
          { icon: FiTrendingUp, label: "Estadísticas", path: "/sales/stats" },
        ]
      : []),
  ];

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      employee: "bg-green-100 text-green-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">POS System</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user?.role)}`}
            >
              {user?.role}
            </span>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
