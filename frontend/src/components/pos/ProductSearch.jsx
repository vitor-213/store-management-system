import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { searchProducts } from "../../api/pos";
import toast from "react-hot-toast";

const ProductSearch = ({ onAddProduct }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // ✅ useCallback para memoizar handleSearch
  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const response = await searchProducts(query.trim());
      setResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      toast.error("Error al buscar productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ useEffect con handleSearch como dependencia
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, handleSearch]);

  const handleSelectProduct = (product) => {
    if (product.stock <= 0) {
      toast.error("Producto sin stock");
      return;
    }
    onAddProduct(product);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder="Buscar producto por nombre o SKU..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          autoFocus
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product._id}
              onClick={() => handleSelectProduct(product)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">SKU: {product.SKU}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </p>
                <p
                  className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  Stock: {product.stock}
                </p>
              </div>
              <FiPlus className="text-primary-500 ml-4" />
            </button>
          ))}
        </div>
      )}

      {showResults &&
        query.trim().length >= 2 &&
        results.length === 0 &&
        !loading && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
            No se encontraron productos
          </div>
        )}
    </div>
  );
};

export default ProductSearch;
