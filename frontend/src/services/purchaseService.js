import api from "./api";

const purchaseService = {

  getAll: async () => {
    const response = await api.get("/purchases");
    return response.data;
  },

  search: async (filters = {}) => {
    const response = await api.get("/purchases", {
      params: filters
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  create: async (purchase) => {
    const response = await api.post("/purchases", purchase);
    return response.data;
  }

};

export default purchaseService;