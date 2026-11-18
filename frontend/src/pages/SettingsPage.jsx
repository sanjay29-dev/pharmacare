
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import pharmacySettingsService from "../services/pharmacySettingsService";
import salesInvoiceSettingsService from "../services/salesInvoiceSettingsService";
import inventorySettingsService from "../services/inventorySettingsService";

const settingTabs = [
  { id: "profile", label: "Pharmacy Profile" },
  { id: "invoice", label: "Sales & Invoice" },
  { id: "inventory", label: "Inventory" },
  { id: "account", label: "Account" },
  { id: "system", label: "System Information" },
];

const emptyProfile = {
  pharmacyName: "",
  address: "",
  phone: "",
  email: "",
  gstNumber: "",
};

const emptyInvoiceSettings = {
  invoicePrefix: "INV",
  defaultTaxRate: 0,
  defaultDiscountRate: 0,
  invoiceFooter: "",
};

const emptyInventorySettings = {
  lowStockAlertEnabled: true,
  expiryAlertEnabled: true,
  expiryAlertDays: 30,
  defaultReorderLevel: 10,
};

function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState("profile");

  // Pharmacy profile state
  const [profile, setProfile] = useState(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Sales and invoice state
  const [invoiceSettings, setInvoiceSettings] =
    useState(emptyInvoiceSettings);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceEditing, setInvoiceEditing] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [invoiceError, setInvoiceError] = useState("");

  // Inventory state
  const [inventorySettings, setInventorySettings] =
    useState(emptyInventorySettings);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [inventoryEditing, setInventoryEditing] = useState(false);
  const [inventoryMessage, setInventoryMessage] = useState("");
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    loadProfile();
    loadInvoiceSettings();
    loadInventorySettings();
  }, []);

  // ---------------- PHARMACY PROFILE ----------------

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const data = await pharmacySettingsService.get();

      setProfile({
        pharmacyName: data.pharmacyName ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        gstNumber: data.gstNumber ?? "",
      });
    } catch (err) {
      console.error("Load pharmacy profile error:", err);
      setProfileError(
        err.response?.data?.message ||
          "Unable to load pharmacy profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      setProfileSaving(true);
      setProfileMessage("");
      setProfileError("");

      const saved = await pharmacySettingsService.update(profile);

      setProfile({
        pharmacyName: saved.pharmacyName ?? "",
        address: saved.address ?? "",
        phone: saved.phone ?? "",
        email: saved.email ?? "",
        gstNumber: saved.gstNumber ?? "",
      });

      setProfileEditing(false);
      setProfileMessage("Pharmacy profile saved successfully.");
    } catch (err) {
      console.error("Save pharmacy profile error:", err);
      setProfileError(
        err.response?.data?.message ||
          "Unable to save pharmacy profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileCancel = async () => {
    setProfileEditing(false);
    setProfileMessage("");
    setProfileError("");
    await loadProfile();
  };

  // ---------------- SALES & INVOICE ----------------

  const loadInvoiceSettings = async () => {
    try {
      setInvoiceLoading(true);
      setInvoiceError("");

      const data = await salesInvoiceSettingsService.get();

      setInvoiceSettings({
        invoicePrefix: data.invoicePrefix ?? "INV",
        defaultTaxRate: data.defaultTaxRate ?? 0,
        defaultDiscountRate: data.defaultDiscountRate ?? 0,
        invoiceFooter: data.invoiceFooter ?? "",
      });
    } catch (err) {
      console.error("Load invoice settings error:", err);
      setInvoiceError(
        err.response?.data?.message ||
          "Unable to load sales and invoice settings."
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleInvoiceChange = (event) => {
    const { name, value } = event.target;

    setInvoiceSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleInvoiceSave = async (event) => {
    event.preventDefault();

    const taxRate = Number(invoiceSettings.defaultTaxRate);
    const discountRate = Number(invoiceSettings.defaultDiscountRate);

    if (
      !Number.isFinite(taxRate) ||
      taxRate < 0 ||
      taxRate > 100 ||
      !Number.isFinite(discountRate) ||
      discountRate < 0 ||
      discountRate > 100
    ) {
      setInvoiceError(
        "Tax and discount rates must be between 0 and 100."
      );
      return;
    }

    if (!invoiceSettings.invoicePrefix.trim()) {
      setInvoiceError("Invoice prefix is required.");
      return;
    }

    try {
      setInvoiceSaving(true);
      setInvoiceMessage("");
      setInvoiceError("");

      const payload = {
        invoicePrefix: invoiceSettings.invoicePrefix.trim(),
        defaultTaxRate: taxRate,
        defaultDiscountRate: discountRate,
        invoiceFooter: invoiceSettings.invoiceFooter,
      };

      const saved = await salesInvoiceSettingsService.update(payload);

      setInvoiceSettings({
        invoicePrefix: saved.invoicePrefix ?? "INV",
        defaultTaxRate: saved.defaultTaxRate ?? 0,
        defaultDiscountRate: saved.defaultDiscountRate ?? 0,
        invoiceFooter: saved.invoiceFooter ?? "",
      });

      setInvoiceEditing(false);
      setInvoiceMessage(
        "Sales and invoice settings saved successfully."
      );
    } catch (err) {
      console.error("Save invoice settings error:", err);
      setInvoiceError(
        err.response?.data?.message ||
          "Unable to save sales and invoice settings."
      );
    } finally {
      setInvoiceSaving(false);
    }
  };

  const handleInvoiceCancel = async () => {
    setInvoiceEditing(false);
    setInvoiceMessage("");
    setInvoiceError("");
    await loadInvoiceSettings();
  };

  // ---------------- INVENTORY SETTINGS ----------------

  const loadInventorySettings = async () => {
    try {
      setInventoryLoading(true);
      setInventoryError("");

      const data = await inventorySettingsService.get();

      setInventorySettings({
        lowStockAlertEnabled:
          data.lowStockAlertEnabled ?? true,
        expiryAlertEnabled:
          data.expiryAlertEnabled ?? true,
        expiryAlertDays: data.expiryAlertDays ?? 30,
        defaultReorderLevel: data.defaultReorderLevel ?? 10,
      });
    } catch (err) {
      console.error("Load inventory settings error:", err);
      setInventoryError(
        err.response?.data?.message ||
          "Unable to load inventory settings."
      );
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleInventoryChange = (event) => {
    const { name, value, type, checked } = event.target;

    setInventorySettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInventorySave = async (event) => {
    event.preventDefault();

    const expiryDays = Number(inventorySettings.expiryAlertDays);
    const reorderLevel = Number(
      inventorySettings.defaultReorderLevel
    );

    if (
      !Number.isInteger(expiryDays) ||
      expiryDays < 1 ||
      expiryDays > 365
    ) {
      setInventoryError(
        "Expiry alert days must be between 1 and 365."
      );
      return;
    }

    if (
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0 ||
      reorderLevel > 100000
    ) {
      setInventoryError(
        "Default reorder level must be between 0 and 100000."
      );
      return;
    }

    try {
      setInventorySaving(true);
      setInventoryMessage("");
      setInventoryError("");

      const payload = {
        lowStockAlertEnabled:
          inventorySettings.lowStockAlertEnabled,
        expiryAlertEnabled:
          inventorySettings.expiryAlertEnabled,
        expiryAlertDays: expiryDays,
        defaultReorderLevel: reorderLevel,
      };

      const saved = await inventorySettingsService.update(payload);

      setInventorySettings({
        lowStockAlertEnabled:
          saved.lowStockAlertEnabled ?? true,
        expiryAlertEnabled:
          saved.expiryAlertEnabled ?? true,
        expiryAlertDays: saved.expiryAlertDays ?? 30,
        defaultReorderLevel: saved.defaultReorderLevel ?? 10,
      });

      setInventoryEditing(false);
      setInventoryMessage(
        "Inventory settings saved successfully."
      );
    } catch (err) {
      console.error("Save inventory settings error:", err);
      setInventoryError(
        err.response?.data?.message ||
          "Unable to save inventory settings."
      );
    } finally {
      setInventorySaving(false);
    }
  };

  const handleInventoryCancel = async () => {
    setInventoryEditing(false);
    setInventoryMessage("");
    setInventoryError("");
    await loadInventorySettings();
  };

  // ---------------- PAGE UI ----------------

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your PharmaCare preferences and configuration.</p>
        </div>
      </div>

      <div className="tabs">
        {settingTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id ? "tab active" : "tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PHARMACY PROFILE */}

      {activeTab === "profile" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Pharmacy Profile</h2>
              <p>Manage your pharmacy business information.</p>
            </div>

            {isAdmin && !profileEditing && (
              <button
                type="button"
                onClick={() => {
                  setProfileEditing(true);
                  setProfileMessage("");
                  setProfileError("");
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {profileMessage && (
            <p className="success-message">{profileMessage}</p>
          )}

          {profileError && (
            <p className="error-message">{profileError}</p>
          )}

          {profileLoading ? (
            <p>Loading pharmacy profile...</p>
          ) : (
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label htmlFor="pharmacyName">
                  Pharmacy Name *
                </label>
                <input
                  id="pharmacyName"
                  name="pharmacyName"
                  value={profile.pharmacyName}
                  onChange={handleProfileChange}
                  maxLength={150}
                  required
                  readOnly={!isAdmin || !profileEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  maxLength={500}
                  rows={3}
                  readOnly={!isAdmin || !profileEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  maxLength={20}
                  readOnly={!isAdmin || !profileEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  maxLength={150}
                  readOnly={!isAdmin || !profileEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gstNumber">GST Number</label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  value={profile.gstNumber}
                  onChange={handleProfileChange}
                  maxLength={30}
                  readOnly={!isAdmin || !profileEditing}
                />
              </div>

              {isAdmin && profileEditing && (
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleProfileCancel}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>
      )}

      {/* SALES & INVOICE */}

      {activeTab === "invoice" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Sales & Invoice</h2>
              <p>
                Configure default values and invoice presentation.
              </p>
            </div>

            {isAdmin && !invoiceEditing && (
              <button
                type="button"
                onClick={() => {
                  setInvoiceEditing(true);
                  setInvoiceMessage("");
                  setInvoiceError("");
                }}
              >
                Edit Settings
              </button>
            )}
          </div>

          {invoiceMessage && (
            <p className="success-message">{invoiceMessage}</p>
          )}

          {invoiceError && (
            <p className="error-message">{invoiceError}</p>
          )}

          {invoiceLoading ? (
            <p>Loading sales and invoice settings...</p>
          ) : (
            <form onSubmit={handleInvoiceSave}>
              <div className="form-group">
                <label htmlFor="invoicePrefix">
                  Invoice Prefix *
                </label>
                <input
                  id="invoicePrefix"
                  name="invoicePrefix"
                  value={invoiceSettings.invoicePrefix}
                  onChange={handleInvoiceChange}
                  maxLength={20}
                  required
                  readOnly={!isAdmin || !invoiceEditing}
                />
                <small>
                  Example: INV-000001. Invoice generation must be
                  connected separately to apply this prefix.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="defaultTaxRate">
                  Default Tax Rate (%)
                </label>
                <input
                  id="defaultTaxRate"
                  name="defaultTaxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceSettings.defaultTaxRate}
                  onChange={handleInvoiceChange}
                  required
                  readOnly={!isAdmin || !invoiceEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="defaultDiscountRate">
                  Default Discount Rate (%)
                </label>
                <input
                  id="defaultDiscountRate"
                  name="defaultDiscountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceSettings.defaultDiscountRate}
                  onChange={handleInvoiceChange}
                  required
                  readOnly={!isAdmin || !invoiceEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="invoiceFooter">
                  Invoice Footer
                </label>
                <textarea
                  id="invoiceFooter"
                  name="invoiceFooter"
                  value={invoiceSettings.invoiceFooter}
                  onChange={handleInvoiceChange}
                  maxLength={500}
                  rows={3}
                  readOnly={!isAdmin || !invoiceEditing}
                />
              </div>

              {isAdmin && invoiceEditing && (
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleInvoiceCancel}
                    disabled={invoiceSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={invoiceSaving}
                  >
                    {invoiceSaving
                      ? "Saving..."
                      : "Save Settings"}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>
      )}

      {/* INVENTORY SETTINGS */}

      {activeTab === "inventory" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Inventory Settings</h2>
              <p>
                Configure stock thresholds and expiry warning
                preferences.
              </p>
            </div>

            {isAdmin && !inventoryEditing && (
              <button
                type="button"
                onClick={() => {
                  setInventoryEditing(true);
                  setInventoryMessage("");
                  setInventoryError("");
                }}
              >
                Edit Settings
              </button>
            )}
          </div>

          {inventoryMessage && (
            <p className="success-message">
              {inventoryMessage}
            </p>
          )}

          {inventoryError && (
            <p className="error-message">
              {inventoryError}
            </p>
          )}

          {inventoryLoading ? (
            <p>Loading inventory settings...</p>
          ) : (
            <form onSubmit={handleInventorySave}>
              <div className="form-group">
                <label htmlFor="lowStockAlertEnabled">
                  <input
                    id="lowStockAlertEnabled"
                    type="checkbox"
                    name="lowStockAlertEnabled"
                    checked={
                      inventorySettings.lowStockAlertEnabled
                    }
                    onChange={handleInventoryChange}
                    disabled={!isAdmin || !inventoryEditing}
                  />
                  {" "}Enable low-stock alerts
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="expiryAlertEnabled">
                  <input
                    id="expiryAlertEnabled"
                    type="checkbox"
                    name="expiryAlertEnabled"
                    checked={
                      inventorySettings.expiryAlertEnabled
                    }
                    onChange={handleInventoryChange}
                    disabled={!isAdmin || !inventoryEditing}
                  />
                  {" "}Enable expiry alerts
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="expiryAlertDays">
                  Expiry Warning Window (Days)
                </label>
                <input
                  id="expiryAlertDays"
                  name="expiryAlertDays"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={inventorySettings.expiryAlertDays}
                  onChange={handleInventoryChange}
                  required
                  readOnly={!isAdmin || !inventoryEditing}
                />
                <small>
                  Warn about batches expiring within this many days.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="defaultReorderLevel">
                  Default Reorder Level (Units)
                </label>
                <input
                  id="defaultReorderLevel"
                  name="defaultReorderLevel"
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  value={inventorySettings.defaultReorderLevel}
                  onChange={handleInventoryChange}
                  required
                  readOnly={!isAdmin || !inventoryEditing}
                />
                <small>
                  Intended for newly configured medicines. Existing
                  medicine reorder levels are not changed.
                </small>
              </div>

              {isAdmin && inventoryEditing && (
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleInventoryCancel}
                    disabled={inventorySaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={inventorySaving}
                  >
                    {inventorySaving
                      ? "Saving..."
                      : "Save Settings"}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>
      )}

      {/* ACCOUNT */}

      {activeTab === "account" && (
        <section className="content-card">
          <h2>Account Information</h2>

          <div className="form-group">
            <label htmlFor="accountUsername">Username</label>
            <input
              id="accountUsername"
              value={user?.username || ""}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountRole">Role</label>
            <input
              id="accountRole"
              value={user?.role || ""}
              readOnly
            />
          </div>
        </section>
      )}

      {/* SYSTEM INFORMATION */}

      {activeTab === "system" && (
        <section className="content-card">
          <h2>System Information</h2>

          <div className="form-group">
            <label htmlFor="systemApplication">
              Application
            </label>
            <input
              id="systemApplication"
              value="PharmaCare"
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="systemFrontend">Frontend</label>
            <input
              id="systemFrontend"
              value="React"
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="systemBackend">Backend</label>
            <input
              id="systemBackend"
              value="Spring Boot"
              readOnly
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default SettingsPage;
