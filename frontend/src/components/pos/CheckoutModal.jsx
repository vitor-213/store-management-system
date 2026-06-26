import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { createSale } from "../../api/pos";

// ✅ Eliminar 'total' de las props si no se usa, o usar el que se pasa
const CheckoutModal = ({ cart, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // ✅ Calcular totales internamente
  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const finalTotal = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
        })),
        customerInfo: customerInfo.name ? customerInfo : undefined,
        paymentMethod,
        discount: discountAmount,
        tax: taxAmount,
        notes: "",
      };

      const response = await createSale(saleData);
      toast.success(
        `Venta #${response.data.invoiceNumber} creada exitosamente`,
      );
      onSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear la venta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Finalizar Venta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resumen del carrito */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Resumen</h3>
            <div className="space-y-1 text-sm">
              {cart.map((item) => (
                <div key={item.product} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Descuento ({discount}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Impuesto ({tax}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Método de Pago</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["cash", "card", "transfer", "mixed"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    paymentMethod === method
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {method === "cash" && "Efectivo"}
                  {method === "card" && "Tarjeta"}
                  {method === "transfer" && "Transferencia"}
                  {method === "mixed" && "Mixto"}
                </button>
              ))}
            </div>
          </div>

          {/* Descuentos e impuestos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuento (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                  )
                }
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impuesto (%)
              </label>
              <input
                type="number"
                value={tax}
                onChange={(e) =>
                  setTax(Math.max(0, parseFloat(e.target.value) || 0))
                }
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Finalizar Venta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
