import api from "./api";

const demandService = {
  getSummary: async () => {
    const response = await api.get("/demand/summary");
    return response.data;
  },

  getFastMoving: async () => {
    const response = await api.get("/demand/fast-moving");
    return response.data;
  },

  getSlowMoving: async () => {
    const response = await api.get("/demand/slow-moving");
    return response.data;
  },

  getReorder: async () => {
    const response = await api.get("/demand/reorder");
    return response.data;
  },
};

export default demandService;