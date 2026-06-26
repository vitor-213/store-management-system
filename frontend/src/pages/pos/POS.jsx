import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiTrash2, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import ProductSearch from "../../components/pos/ProductSearch";
import CartItem from "../../components/pos/CartItem";
import CheckoutModal from "../../components/pos/CheckoutModal";

const POS = () => {
  const navigate = useNavigate();

  // ✅ Cargar carrito DIRECTAMENTE en el estado inicial
  const getInitialCart = () => {
    const savedCart = localStorage.getItem("pos_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          return parsedCart;
        }
      } catch {
        localStorage.removeItem("pos_cart");
      }
    }
    return [];
  };

  const [cart, setCart] = useState(getInitialCart);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  // ✅ Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("pos_cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("pos_cart");
    }
  }, [cart]);

  const addProduct = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("No hay suficiente stock");
          return prev;
        }
        return prev.map((item) =>
          item.product === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          sku: product.SKU,
          unitPrice: product.price,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
    toast.success(`${product.name} agregado`);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          if (newQuantity > item.maxStock) {
            toast.error("Stock insuficiente");
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const removeProduct = (productId) => {
    setCart((prev) => prev.filter((item) => item.product !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("¿Vaciar carrito?")) {
      setCart([]);
      localStorage.removeItem("pos_cart");
    }
  };

  const handleCheckoutSuccess = (sale) => {
    setLastSale(sale);
    setCart([]);
    localStorage.removeItem("pos_cart");
    setShowCheckout(false);
    toast.success(`Venta #${sale.invoiceNumber} completada`);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
        <div className="flex items-center gap-4">
          {lastSale && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <FiCheckCircle className="w-5 h-5" />
              <span>Última venta: #{lastSale.invoiceNumber}</span>
            </div>
          )}
          <button
            onClick={() => navigate("/sales")}
            className="text-gray-600 hover:text-primary-600 transition"
          >
            Ver Ventas
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Panel izquierdo - Búsqueda y productos */}
        <div className="flex-1 flex flex-col min-h-0">
          <ProductSearch onAddProduct={addProduct} />

          <div className="mt-4 flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FiShoppingBag className="w-16 h-16 mb-4" />
                <p>Carrito vacío</p>
                <p className="text-sm">Busca productos arriba</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Carrito */}
        <div className="w-96 bg-white rounded-lg shadow-lg flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              Carrito ({totalItems} items)
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
              >
                <FiTrash2 className="w-4 h-4" />
                Vaciar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <p>No hay productos en el carrito</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.product}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeProduct}
                />
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default POS;
