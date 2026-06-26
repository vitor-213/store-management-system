import {
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";

const Dashboard = () => {
  const stats = [
    { icon: FiPackage, label: "Productos", value: "0", color: "bg-blue-500" },
    {
      icon: FiShoppingCart,
      label: "Ventas Hoy",
      value: "0",
      color: "bg-green-500",
    },
    {
      icon: FiDollarSign,
      label: "Ingresos",
      value: "$0",
      color: "bg-yellow-500",
    },
    { icon: FiUsers, label: "Clientes", value: "0", color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
          >
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas ventas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Últimas Ventas</h2>
          <p className="text-gray-500 text-sm">No hay ventas registradas aún</p>
        </div>

        {/* Productos con bajo stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Productos con Bajo Stock</h2>
          <p className="text-gray-500 text-sm">
            No hay productos con bajo stock
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
