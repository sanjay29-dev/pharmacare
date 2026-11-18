import api from "./api";

const inventoryService = {

  getAll: async () => {
    const response = await api.get("/inventory");
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get("/inventory/low-stock");
    return response.data;
  },

  getOutOfStock: async () => {
    const response = await api.get("/inventory/out-of-stock");
    return response.data;
  },

  getTransactions: async (filters = {}) => {
    const response = await api.get("/inventory/transactions", {
      params: filters
    });

    return response.data;
  }
};

export default inventoryService;