import { useState, useEffect, useRef, useCallback } from "react";
import { FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  checkLowStock,
} from "../../api/inventory";

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 20;
  const isFirstRender = useRef(true);

  // ✅ useCallback para memoizar fetchAlerts
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(filterStatus && { status: filterStatus }),
      };
      const response = await getAlerts(params);
      setAlerts(response.alerts || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      toast.error("Error al cargar alertas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page, limit]);

  // ✅ Primer useEffect con fetchAlerts como dependencia
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchAlerts();
    }
  }, [fetchAlerts]);

  // ✅ Segundo useEffect para cambios en filtros y página
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchAlerts();
    }
  }, [fetchAlerts]);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      toast.success("Alerta reconocida");
      fetchAlerts();
    } catch (err) {
      toast.error("Error al reconocer alerta");
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      toast.success("Alerta resuelta");
      fetchAlerts();
    } catch (err) {
      toast.error("Error al resolver alerta");
      console.error(err);
    }
  };

  const handleCheckStock = async () => {
    try {
      const result = await checkLowStock();
      toast.success(`${result.created} nuevas alertas creadas`);
      fetchAlerts();
    } catch (err) {
      toast.error("Error al verificar stock");
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchAlerts();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-red-100 text-red-700",
      acknowledged: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    if (type === "out_of_stock") return "🔴";
    if (type === "low_stock") return "🟡";
    return "🔵";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Alertas de Inventario
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleCheckStock}
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
          >
            <FiRefreshCw className="w-4 h-4" />
            Verificar Stock
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="acknowledged">Reconocidas</option>
            <option value="resolved">Resueltas</option>
          </select>
          <span className="text-sm text-gray-500 self-center">
            {total} alertas totales
          </span>
        </div>
      </div>

      {/* Alertas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              Cargando alertas...
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p>No hay alertas de inventario</p>
            <p className="text-sm">Todo está en orden con el stock</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                alert.status === "active"
                  ? "border-red-500"
                  : alert.status === "acknowledged"
                    ? "border-yellow-500"
                    : "border-green-500"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {alert.product?.name || "Producto eliminado"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        SKU: {alert.product?.SKU}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{alert.message}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>
                      Stock actual: <strong>{alert.currentStock}</strong>
                    </span>
                    <span>
                      Stock mínimo: <strong>{alert.minStock}</strong>
                    </span>
                    {alert.acknowledgedBy && (
                      <span>Reconocido por: {alert.acknowledgedBy.name}</span>
                    )}
                    {alert.acknowledgedAt && (
                      <span>
                        Reconocido: {formatDate(alert.acknowledgedAt)}
                      </span>
                    )}
                    {alert.resolvedAt && (
                      <span>Resuelto: {formatDate(alert.resolvedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.status === "active" && (
                    <button
                      onClick={() => handleAcknowledge(alert._id)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition"
                    >
                      Reconocer
                    </button>
                  )}
                  {(alert.status === "active" ||
                    alert.status === "acknowledged") && (
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {alerts.length} de {total} alertas
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
