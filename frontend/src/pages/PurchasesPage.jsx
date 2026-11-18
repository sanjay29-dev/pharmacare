
import { useEffect, useMemo, useState } from "react";
import purchaseService from "../services/purchaseService";
import supplierService from "../services/supplierService";
import medicineService from "../services/medicineService";
import { useAuth } from "../context/AuthContext";
import "./Purchases.css";

const createEmptyItem = () => ({
  medicineId: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
  quantity: "",
  purchasePrice: "",
  sellingPrice: "",
  mrp: "",
});

const createEmptyForm = () => ({
  supplierId: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  notes: "",
  items: [createEmptyItem()],
});

const PurchasesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [form, setForm] = useState(createEmptyForm);

  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.status === "ACTIVE"),
    [suppliers]
  );

  const activeMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.status === "ACTIVE"),
    [medicines]
  );

  const filteredPurchases = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return purchases;

    return purchases.filter((purchase) =>
      [
        purchase.invoiceNumber,
        purchase.supplierName,
        purchase.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [purchases, search]);

  const purchaseTotal = useMemo(
    () => purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount || 0),
      0
    ),
    [purchases]
  );

  const receivedCount = purchases.filter(
    (purchase) => purchase.status === "RECEIVED"
  ).length;

  const cancelledCount = purchases.filter(
    (purchase) => purchase.status === "CANCELLED"
  ).length;

  const formTotal = useMemo(
    () =>
      form.items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.purchasePrice || 0),
        0
      ),
    [form.items]
  );

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setMessage("Unable to load suppliers.");
      setMessageType("error");
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getAll();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      setMessage("Unable to load medicines.");
      setMessageType("error");
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setMessage("");

      const filters = {};

      if (supplierId) filters.supplierId = supplierId;
      if (status) filters.status = status;

      const data = await purchaseService.search(filters);
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load purchases:", error);
      setMessage(
        error.response?.data?.message || "Failed to load purchases."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadSuppliers();
    loadMedicines();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    loadPurchases();
  }, [supplierId, status, isAdmin]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [name]: value }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, createEmptyItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
  };

  const getExpiryWarning = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${expiryDate}T00:00:00`);
    const difference = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (difference < 0) {
      return {
        type: "expired",
        text: "This batch is already expired.",
      };
    }

    if (difference <= 60) {
      return {
        type: "warning",
        text: `Expires in ${difference} day(s).`,
      };
    }

    return null;
  };

  const validateForm = () => {
    if (!form.supplierId) {
      return "Please select a supplier.";
    }

    if (!form.purchaseDate) {
      return "Please select a purchase date.";
    }

    if (!form.items.length) {
      return "Please add at least one purchase item.";
    }

    for (let index = 0; index < form.items.length; index++) {
      const item = form.items[index];
      const itemNumber = index + 1;

      if (
        !item.medicineId ||
        !item.batchNumber.trim() ||
        !item.expiryDate ||
        !item.quantity ||
        !item.purchasePrice ||
        item.sellingPrice === "" ||
        item.mrp === ""
      ) {
        return `Please complete all required fields for Item ${itemNumber}.`;
      }

      if (Number(item.quantity) <= 0) {
        return `Quantity must be greater than zero for Item ${itemNumber}.`;
      }

      if (
        Number(item.purchasePrice) <= 0 ||
        Number(item.sellingPrice) < 0 ||
        Number(item.mrp) < 0
      ) {
        return `Please enter valid prices for Item ${itemNumber}.`;
      }

      if (
        item.manufacturingDate &&
        item.manufacturingDate > item.expiryDate
      ) {
        return `Manufacturing date cannot be after expiry date for Item ${itemNumber}.`;
      }

      const expiryWarning = getExpiryWarning(item.expiryDate);

      if (expiryWarning?.type === "expired") {
        return `Item ${itemNumber}: ${expiryWarning.text}`;
      }
    }

    return null;
  };

  const handleCreatePurchase = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        supplierId: Number(form.supplierId),
        purchaseDate: form.purchaseDate,
        notes: form.notes,
        items: form.items.map((item) => ({
          medicineId: Number(item.medicineId),
          batchNumber: item.batchNumber.trim(),
          manufacturingDate: item.manufacturingDate || null,
          expiryDate: item.expiryDate,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
          sellingPrice: Number(item.sellingPrice),
          mrp: Number(item.mrp),
        })),
      };

      await purchaseService.create(payload);

      setShowForm(false);
      resetForm();

      setMessage("Purchase created successfully.");
      setMessageType("success");

      await loadPurchases();
    } catch (error) {
      console.error("Failed to create purchase:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create purchase."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleViewPurchase = async (id) => {
    try {
      setMessage("");

      const purchase = await purchaseService.getById(id);

      setSelectedPurchase(purchase);
      setShowDetails(true);
    } catch (error) {
      console.error("Failed to load purchase details:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load purchase details."
      );
      setMessageType("error");
    }
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}`.slice(0, 10) + "T00:00:00")
      .toLocaleDateString("en-IN");
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  if (!isAdmin) {
    return (
      <div className="page-container">
        <h1>Access Denied</h1>
        <p>You do not have permission to view purchases.</p>
      </div>
    );
  }

  return (
    <div className="page-container purchases-page">
      {/* PAGE HEADER */}
      <div className="page-header purchases-header">
        <div>
          <h1>Purchase Management</h1>
          <p>
            Manage supplier purchases, received stock and batch details.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadPurchases}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setMessage("");
              setShowForm(true);
            }}
          >
            + New Purchase
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {message && (
        <div
          className={`purchase-alert ${
            messageType === "success" ? "success" : "error"
          }`}
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="purchase-summary-grid">
        <div className="purchase-summary-card">
          <div className="purchase-summary-icon">📦</div>
          <div>
            <span>Total Purchases</span>
            <strong>{purchases.length}</strong>
          </div>
        </div>

        <div className="purchase-summary-card">
          <div className="purchase-summary-icon">₹</div>
          <div>
            <span>Total Purchase Value</span>
            <strong>{formatMoney(purchaseTotal)}</strong>
          </div>
        </div>

        <div className="purchase-summary-card">
          <div className="purchase-summary-icon">✓</div>
          <div>
            <span>Received Purchases</span>
            <strong>{receivedCount}</strong>
          </div>
        </div>

        <div className="purchase-summary-card">
          <div className="purchase-summary-icon">!</div>
          <div>
            <span>Cancelled Purchases</span>
            <strong>{cancelledCount}</strong>
          </div>
        </div>
      </div>

      {/* PURCHASE HISTORY */}
      <div className="purchase-history-card">
        <div className="purchase-section-header">
          <div>
            <h2>Purchase History</h2>
            <p>View and manage your recorded purchases.</p>
          </div>
          <span className="purchase-record-count">
            {filteredPurchases.length} records
          </span>
        </div>

        {/* FILTERS */}
        <div className="purchase-filter-grid">
          <div className="form-group">
            <label htmlFor="purchase-search">
              Search
            </label>
            <input
              id="purchase-search"
              type="text"
              placeholder="Search invoice or supplier..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier-filter">
              Supplier
            </label>
            <select
              id="supplier-filter"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              <option value="">All Suppliers</option>
              {activeSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status-filter">
              Purchase Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="purchase-empty-state">
            <div className="purchase-loader" />
            <p>Loading purchase records...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="purchase-empty-state">
            <div className="purchase-empty-icon">📋</div>
            <h3>No purchases found</h3>
            <p>
              No records match your current filters.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setSupplierId("");
                setStatus("");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table purchase-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Supplier</th>
                  <th>Purchase Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <strong>{purchase.invoiceNumber}</strong>
                    </td>
                    <td>{purchase.supplierName}</td>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>{purchase.items?.length || 0}</td>
                    <td>
                      <strong>
                        {formatMoney(purchase.totalAmount)}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          String(purchase.status || "").toLowerCase()
                        }`}
                      >
                        {String(purchase.status || "").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleViewPurchase(purchase.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW PURCHASE MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal purchase-modal purchase-form-modal">
            <div className="modal-header">
              <div>
                <h2>Create New Purchase</h2>
                <p>
                  Enter supplier and batch information to add stock.
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePurchase}>
              <div className="purchase-form-section">
                <h3>Purchase Information</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="purchase-supplier">
                      Supplier *
                    </label>
                    <select
                      id="purchase-supplier"
                      name="supplierId"
                      value={form.supplierId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {activeSuppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="purchase-date">
                      Purchase Date *
                    </label>
                    <input
                      id="purchase-date"
                      type="date"
                      name="purchaseDate"
                      value={form.purchaseDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="purchase-form-section">
                <div className="purchase-items-header">
                  <div>
                    <h3>Purchase Items</h3>
                    <p>Add one or more medicine batches.</p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>

                {form.items.map((item, index) => {
                  const warning = getExpiryWarning(item.expiryDate);
                  const lineTotal =
                    Number(item.quantity || 0) *
                    Number(item.purchasePrice || 0);

                  return (
                    <div className="purchase-item-card" key={index}>
                      <div className="purchase-item-title">
                        <div>
                          <span className="purchase-item-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <strong>Medicine Item {index + 1}</strong>
                        </div>

                        {form.items.length > 1 && (
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Medicine *</label>
                          <select
                            name="medicineId"
                            value={item.medicineId}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          >
                            <option value="">Select Medicine</option>
                            {activeMedicines.map((medicine) => (
                              <option
                                key={medicine.id}
                                value={medicine.id}
                              >
                                {medicine.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Batch Number *</label>
                          <input
                            type="text"
                            name="batchNumber"
                            placeholder="Enter batch number"
                            value={item.batchNumber}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Manufacturing Date</label>
                          <input
                            type="date"
                            name="manufacturingDate"
                            value={item.manufacturingDate}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input
                            type="date"
                            name="expiryDate"
                            value={item.expiryDate}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                          {warning && (
                            <small
                              className={`purchase-expiry-message ${warning.type}`}
                            >
                              {warning.text}
                            </small>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            name="quantity"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Purchase Price (₹) *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            name="purchasePrice"
                            placeholder="0.00"
                            value={item.purchasePrice}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Selling Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="sellingPrice"
                            placeholder="0.00"
                            value={item.sellingPrice}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>MRP (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="mrp"
                            placeholder="0.00"
                            value={item.mrp}
                            onChange={(event) =>
                              handleItemChange(index, event)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="purchase-line-total">
                        <span>Item Total</span>
                        <strong>{formatMoney(lineTotal)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="purchase-form-section">
                <div className="form-group">
                  <label htmlFor="purchase-notes">
                    Purchase Notes
                  </label>
                  <textarea
                    id="purchase-notes"
                    name="notes"
                    rows="3"
                    maxLength="500"
                    placeholder="Add any additional information..."
                    value={form.notes}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="purchase-grand-total">
                <span>Grand Total</span>
                <strong>{formatMoney(formTotal)}</strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving Purchase..." : "Save Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE DETAILS MODAL */}
      {showDetails && selectedPurchase && (
        <div className="modal-overlay">
          <div className="modal purchase-details-modal">
            <div className="modal-header">
              <div>
                <h2>Purchase Details</h2>
                <p>{selectedPurchase.invoiceNumber}</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedPurchase(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="purchase-details-summary">
              <div>
                <span>Invoice Number</span>
                <strong>{selectedPurchase.invoiceNumber}</strong>
              </div>

              <div>
                <span>Supplier</span>
                <strong>{selectedPurchase.supplierName}</strong>
              </div>

              <div>
                <span>Purchase Date</span>
                <strong>{formatDate(selectedPurchase.purchaseDate)}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedPurchase.status}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>
                  {formatMoney(selectedPurchase.totalAmount)}
                </strong>
              </div>
            </div>

            <div className="purchase-details-items">
              <h3>Purchased Items</h3>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Qty</th>
                      <th>Purchase Price</th>
                      <th>MRP</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedPurchase.items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.medicineName}</strong>
                        </td>
                        <td>{item.batchNumber}</td>
                        <td>{formatDate(item.expiryDate)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.purchasePrice)}</td>
                        <td>{formatMoney(item.mrp)}</td>
                        <td>
                          <strong>{formatMoney(item.lineTotal)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedPurchase.notes && (
              <div className="purchase-details-notes">
                <h3>Notes</h3>
                <p>{selectedPurchase.notes}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedPurchase(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
