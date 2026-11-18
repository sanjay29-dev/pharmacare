import api from "./api";

const supplierService = {
  getAll: async () => {
    const response = await api.get("/suppliers");
    return response.data;
  },

  search: async (name) => {
    const response = await api.get("/suppliers", {
      params: { search: name }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplier) => {
    const response = await api.post("/suppliers", supplier);
    return response.data;
  },

  update: async (id, supplier) => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  deactivate: async (id) => {
    await api.delete(`/suppliers/${id}`);
  }
};

export default supplierService;