import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const total = item.unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        <p className="text-sm text-primary-600 font-medium">
          ${item.unitPrice.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="text-right min-w-[80px]">
        <p className="font-bold text-gray-900">${total.toFixed(2)}</p>
      </div>

      <button
        onClick={() => onRemove(item.product)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
