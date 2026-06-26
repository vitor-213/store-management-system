import api from "./axios";

// ============ VENTAS ============
export const getSales = async (params = {}) => {
  const response = await api.get("/sales", { params });
  return response.data;
};

export const getSale = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const getSaleByInvoice = async (invoice) => {
  const response = await api.get(`/sales/invoice/${invoice}`);
  return response.data;
};

export const getTodaySales = async () => {
  const response = await api.get("/sales/today");
  return response.data;
};

export const getSalesStats = async (params = {}) => {
  const response = await api.get("/sales/stats", { params });
  return response.data;
};

export const createSale = async (data) => {
  const response = await api.post("/sales", data);
  return response.data;
};

export const updateSale = async (id, data) => {
  const response = await api.put(`/sales/${id}`, data);
  return response.data;
};

export const cancelSale = async (id, data) => {
  const response = await api.patch(`/sales/${id}/cancel`, data);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return response.data;
};
