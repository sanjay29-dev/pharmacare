
import api from "./api";

const saleService = {
  getAll: async () => {
    const response = await api.get("/sales");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  search: async (filters = {}) => {
    const response = await api.get("/sales", {
      params: filters,
    });
    return response.data;
  },

  create: async (sale) => {
    const response = await api.post("/sales", sale);
    return response.data;
  },
};

export default saleService;
