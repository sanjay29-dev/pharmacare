
import api from "./api";

const inventorySettingsService = {
  get: async () => {
    const response = await api.get("/settings/inventory");
    return response.data;
  },

  update: async (settings) => {
    const response = await api.put("/settings/inventory", settings);
    return response.data;
  },
};

export default inventorySettingsService;
