import api from "./axios";

export const searchProducts = async (query) => {
  const response = await api.get("/products", {
    params: { search: query, limit: 20 },
  });
  return response.data;
};

export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`);
  return response.data;
};

export const createSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};
