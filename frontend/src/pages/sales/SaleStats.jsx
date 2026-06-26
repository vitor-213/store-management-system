import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import { getSale } from "../../api/sales";

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSale();
  }, [id]);

  const fetchSale = async () => {
    try {
      const response = await getSale(id);
      setSale(response.data);
    } catch (error) {
      toast.error("Error al cargar la venta");
      navigate("/sales");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-8 text-gray-500">Venta no encontrada</div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/sales")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Venta #{sale.invoiceNumber}
        </h1>
        <span
          className={`px-3 py-1 text-sm rounded-full ${getStatusColor(sale.status)}`}
        >
          {sale.status === "completed"
            ? "Completada"
            : sale.status === "cancelled"
              ? "Cancelada"
              : "Reembolsada"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la venta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Información del Cliente
            </h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-500">Nombre:</span>{" "}
                {sale.customer?.name ||
                  sale.customerInfo?.name ||
                  "Cliente anónimo"}
              </p>
              {sale.customer?.email && (
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {sale.customer.email}
                </p>
              )}
              {sale.customer?.phone && (
                <p>
                  <span className="text-gray-500">Teléfono:</span>{" "}
                  {sale.customer.phone}
                </p>
              )}
              {sale.customerInfo?.address && (
                <p>
                  <span className="text-gray-500">Dirección:</span>{" "}
                  {sale.customerInfo.address}
                </p>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-right font-medium"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(sale.subtotal)}
                    </td>
                  </tr>
                  {sale.discount > 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-right text-red-500"
                      >
                        Descuento
                      </td>
                      <td className="px-4 py-3 text-right text-red-500">
                        -{formatCurrency(sale.discount)}
                      </td>
                    </tr>
                  )}
                  {sale.tax > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right">
                        Impuesto
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(sale.tax)}
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right text-lg">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-lg text-primary-600">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Resumen</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha</span>
                <span>{formatDate(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método de pago</span>
                <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado del pago</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    sale.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : sale.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sale.paymentStatus === "paid"
                    ? "Pagado"
                    : sale.paymentStatus === "pending"
                      ? "Pendiente"
                      : "Parcial"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vendido por</span>
                <span>{sale.createdBy?.name || "Sistema"}</span>
              </div>
              {sale.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">Notas:</p>
                  <p className="text-sm">{sale.notes}</p>
                </div>
              )}
              {sale.cancelledAt && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-red-500 text-sm">Cancelado:</p>
                  <p className="text-sm text-red-500">
                    {sale.cancellationReason}
                  </p>
                  <p className="text-xs text-gray-500">
                    por {sale.cancelledBy?.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Acciones</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiPrinter className="w-4 h-4" />
                Imprimir Ticket
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <FiDownload className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetail;
