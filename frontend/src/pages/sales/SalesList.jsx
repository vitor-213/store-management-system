import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiSearch, FiEye, FiShoppingBag } from "react-icons/fi";
import toast from "react-hot-toast";
import { getSales, cancelSale } from "../../api/sales";

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentMethod: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  const limit = 20;
  const isFirstRender = useRef(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      const response = await getSales(params);
      setSales(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Error al cargar ventas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchSales();
    }
  }, [fetchSales]);

  useEffect(() => {
    if (!isFirstRender.current) {
      fetchSales();
    }
  }, [fetchSales]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleCancelSale = async (id, invoiceNumber) => {
    if (!window.confirm(`¿Cancelar la venta #${invoiceNumber}?`)) return;

    try {
      const reason = window.prompt("Motivo de cancelación:");
      if (!reason) return;

      await cancelSale(id, { reason });
      toast.success("Venta cancelada");
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cancelar");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      mixed: "Mixto",
    };
    return labels[method] || method;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      partially_paid: "bg-blue-100 text-blue-700",
      refunded: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
        <div className="flex gap-3">
          <Link
            to="/pos"
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
          >
            <FiShoppingBag className="w-4 h-4" />
            Nueva Venta
          </Link>
          <button
            onClick={fetchSales}
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Buscar..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="refunded">Reembolsadas</option>
          </select>
          <select
            name="paymentMethod"
            value={filters.paymentMethod}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="mixed">Mixto</option>
          </select>
          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Estado de pago</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="partially_paid">Parcial</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {sale.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.items?.length || 0} productos
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {sale.customer?.name ||
                          sale.customerInfo?.name ||
                          "Cliente anónimo"}
                      </p>
                      {sale.customer?.email && (
                        <p className="text-sm text-gray-500">
                          {sale.customer.email}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary-600">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getPaymentMethodLabel(sale.paymentMethod)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sale.status)}`}
                      >
                        {sale.status === "completed"
                          ? "Completada"
                          : sale.status === "cancelled"
                            ? "Cancelada"
                            : "Reembolsada"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(sale.paymentStatus)}`}
                      >
                        {sale.paymentStatus === "paid"
                          ? "Pagado"
                          : sale.paymentStatus === "pending"
                            ? "Pendiente"
                            : sale.paymentStatus === "partially_paid"
                              ? "Parcial"
                              : "Reembolsado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/sales/${sale._id}`}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          title="Ver detalles"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {sale.status === "completed" && (
                          <button
                            onClick={() =>
                              handleCancelSale(sale._id, sale.invoiceNumber)
                            }
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Cancelar venta"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {sales.length} de {total} ventas
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
    </div>
  );
};

export default SalesList;
