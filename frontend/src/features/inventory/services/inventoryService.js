import api from "../../../api/axios.js";

export const getMovements = async (params = {}) => {
  const response = await api.get("/inventory/movements", { params });
  return response.data;
};

export const getMovementById = async (id) => {
  const response = await api.get(`/inventory/movements/${id}`);
  return response.data;
};

export const createMovement = async (data) => {
  const response = await api.post("/inventory/movements", data);
  return response.data;
};

export const getProductInventorySummary = async (productId, params = {}) => {
  const response = await api.get(`/inventory/products/${productId}/summary`, { params });
  return response.data;
};

export const getAlerts = async (params = {}) => {
  const response = await api.get("/inventory/alerts", { params });
  return response.data;
};

export const getAlertById = async (id) => {
  const response = await api.get(`/inventory/alerts/${id}`);
  return response.data;
};

export const acknowledgeAlert = async (id) => {
  const response = await api.patch(`/inventory/alerts/${id}/acknowledge`);
  return response.data;
};

export const resolveAlert = async (id) => {
  const response = await api.patch(`/inventory/alerts/${id}/resolve`);
  return response.data;
};

export const checkLowStock = async () => {
  const response = await api.post("/inventory/alerts/check");
  return response.data;
};
