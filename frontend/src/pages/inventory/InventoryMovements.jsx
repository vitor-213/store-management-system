import { useState, useEffect, useRef, useCallback } from "react";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { getMovements } from "../../api/inventory";

const InventoryMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    direction: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const limit = 20;
  const isFirstRender = useRef(true);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.direction && { direction: filters.direction }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
      };
      const response = await getMovements(params);
      setMovements(response.movements || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Error al cargar movimientos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  // Usar useEffect con un flag para evitar render inicial
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchMovements();
    }
  }, [fetchMovements]);

  // Efecto separado para cambios en filters y page
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchMovements();
    }
  }, [fetchMovements]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Resetear a página 1 cuando cambia filtro
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleRefresh = () => {
    fetchMovements();
  };

  const getTypeColor = (type) => {
    const colors = {
      purchase_in: "bg-green-100 text-green-700",
      sale_out: "bg-red-100 text-red-700",
      adjustment: "bg-yellow-100 text-yellow-700",
      return_in: "bg-blue-100 text-blue-700",
      return_out: "bg-orange-100 text-orange-700",
      initial: "bg-purple-100 text-purple-700",
      transfer_in: "bg-cyan-100 text-cyan-700",
      transfer_out: "bg-pink-100 text-pink-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getDirectionBadge = (direction) => {
    return direction === "in"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Movimientos de Inventario
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="purchase_in">Compra</option>
            <option value="sale_out">Venta</option>
            <option value="adjustment">Ajuste</option>
            <option value="return_in">Devolución (entrada)</option>
            <option value="return_out">Devolución (salida)</option>
            <option value="initial">Inicial</option>
          </select>
          <select
            name="direction"
            value={filters.direction}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las direcciones</option>
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
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

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dirección
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.product?.name || "Producto eliminado"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {movement.product?.SKU}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTypeColor(movement.type)}`}
                      >
                        {movement.type?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getDirectionBadge(movement.direction)}`}
                      >
                        {movement.direction === "in" ? "⬆ Entrada" : "⬇ Salida"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm">
                        {movement.stockBefore} → {movement.stockAfter}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.performedBy?.name || "Sistema"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(movement.createdAt)}
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
              Mostrando {movements.length} de {total} movimientos
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

export default InventoryMovements;
