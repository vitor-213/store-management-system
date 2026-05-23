import { create } from "zustand";
import * as inventoryService from "../services/inventoryService.js";

const useInventoryStore = create((set, get) => ({
  movements: [],
  movementsTotal: 0,
  movementsPage: 1,
  movementsTotalPages: 1,
  movementsLoading: false,

  alerts: [],
  alertsTotal: 0,
  alertsPage: 1,
  alertsTotalPages: 1,
  alertsLoading: false,

  productSummary: null,
  productSummaryLoading: false,

  lastCheckResult: null,

  fetchMovements: async (params = {}) => {
    set({ movementsLoading: true });
    try {
      const result = await inventoryService.getMovements(params);
      set({
        movements: result.movements,
        movementsTotal: result.total,
        movementsPage: result.page,
        movementsTotalPages: result.totalPages,
      });
    } finally {
      set({ movementsLoading: false });
    }
  },

  fetchAlerts: async (params = {}) => {
    set({ alertsLoading: true });
    try {
      const result = await inventoryService.getAlerts(params);
      set({
        alerts: result.alerts,
        alertsTotal: result.total,
        alertsPage: result.page,
        alertsTotalPages: result.totalPages,
      });
    } finally {
      set({ alertsLoading: false });
    }
  },

  fetchProductSummary: async (productId, params = {}) => {
    set({ productSummaryLoading: true });
    try {
      const result = await inventoryService.getProductInventorySummary(productId, params);
      set({ productSummary: result.data });
    } finally {
      set({ productSummaryLoading: false });
    }
  },

  adjustStock: async (data) => {
    const result = await inventoryService.createMovement(data);
    return result;
  },

  acknowledgeAlert: async (id) => {
    const result = await inventoryService.acknowledgeAlert(id);
    set((state) => ({
      alerts: state.alerts.map((a) => (a._id === id ? result.data : a)),
    }));
    return result;
  },

  resolveAlert: async (id) => {
    const result = await inventoryService.resolveAlert(id);
    set((state) => ({
      alerts: state.alerts.map((a) => (a._id === id ? result.data : a)),
    }));
    return result;
  },

  checkLowStock: async () => {
    const result = await inventoryService.checkLowStock();
    set({ lastCheckResult: result });
    return result;
  },
}));

export default useInventoryStore;
