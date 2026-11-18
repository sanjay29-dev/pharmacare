import api from "./api";

const medicineService = {

  getAll: async () => {
    const response = await api.get("/medicines");
    return response.data;
  },

  search: async (name) => {
    const response = await api.get("/medicines", {
      params: { search: name }
    });
    return response.data;
  },

  create: async (medicine) => {
    const response = await api.post("/medicines", medicine);
    return response.data;
  },

  update: async (id, medicine) => {
    const response = await api.put(`/medicines/${id}`, medicine);
    return response.data;
  },

  getDetails: async (id) => {
  const response = await api.get(`/medicines/${id}/details`);
  return response.data;
    },

  deactivate: async (id) => {
    await api.delete(`/medicines/${id}`);
  }
};

export default medicineService;