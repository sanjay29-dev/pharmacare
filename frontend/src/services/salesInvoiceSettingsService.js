
import api from "./api";

const salesInvoiceSettingsService = {
  get: async () => {
    const response = await api.get("/settings/sales-invoice");
    return response.data;
  },

  update: async (settings) => {
    const response = await api.put("/settings/sales-invoice", settings);
    return response.data;
  },
};

export default salesInvoiceSettingsService;
