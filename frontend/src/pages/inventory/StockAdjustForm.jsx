import { useState } from "react";
import toast from "react-hot-toast";
import { createMovement } from "../../api/inventory";

const StockAdjustForm = ({
  productId,
  productName,
  currentStock,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "adjustment",
    quantity: 0,
    reason: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    setLoading(true);
    try {
      await createMovement({
        productId,
        ...formData,
        quantity: formData.quantity,
        reason: formData.reason || "Ajuste manual",
      });
      toast.success("Stock ajustado correctamente");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al ajustar stock");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Producto
        </label>
        <p className="text-gray-900 font-medium">{productName}</p>
        <p className="text-sm text-gray-500">Stock actual: {currentStock}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad *
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo
        </label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Ej: Ajuste por inventario físico"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
        >
          {loading ? "Ajustando..." : "Ajustar Stock"}
        </button>
      </div>
    </form>
  );
};

export default StockAdjustForm;
