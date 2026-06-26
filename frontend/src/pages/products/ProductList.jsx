import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  getProducts,
  deleteProduct,
  toggleProductStatus,
} from "../../api/products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  useEffect(() => {
    fetchProducts();
  }, [search, category, filterLowStock, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(category && { category }),
        ...(filterLowStock && { lowStock: "true" }),
      };
      const response = await getProducts(params);
      setProducts(response.data || []);
      setPagination({
        ...pagination,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      toast.error("Error al cargar productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success("Producto eliminado");
      fetchProducts();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleProductStatus(id);
      toast.success(`Producto ${currentStatus ? "desactivado" : "activado"}`);
      fetchProducts();
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      electronics: "bg-blue-100 text-blue-700",
      clothing: "bg-purple-100 text-purple-700",
      food: "bg-green-100 text-green-700",
      beverages: "bg-cyan-100 text-cyan-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.other;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <Link
          to="/products/new"
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          <FiPlus />
          Nuevo Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            <option value="electronics">Electrónicos</option>
            <option value="clothing">Ropa</option>
            <option value="food">Comida</option>
            <option value="beverages">Bebidas</option>
            <option value="other">Otros</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm">Mostrar solo bajo stock</span>
          </label>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
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
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay productos
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.SKU}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(product.category)}`}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${product.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${product.stock <= product.minStock ? "text-red-600 font-semibold" : "text-gray-600"}`}
                      >
                        {product.stock || 0}
                      </span>
                      {product.stock <= product.minStock && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Bajo stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          title="Ver"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/products/${product._id}/edit`}
                          className="p-1 text-yellow-500 hover:bg-yellow-50 rounded"
                          title="Editar"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleToggleStatus(product._id, product.isActive)
                          }
                          className="p-1 text-orange-500 hover:bg-orange-50 rounded"
                          title={product.isActive ? "Desactivar" : "Activar"}
                        >
                          {product.isActive ? "🔴" : "🟢"}
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {products.length} de {pagination.total} productos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.totalPages}
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

export default ProductList;
