import api from "./api";

const pharmacySettingsService = {
  get: async () => {
    const response = await api.get("/settings/pharmacy");
    return response.data;
  },

  update: async (settings) => {
    const response = await api.put("/settings/pharmacy", settings);
    return response.data;
  },
};

export default pharmacySettingsService;