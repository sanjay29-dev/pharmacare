import { useEffect, useState } from "react";
import supplierService from "../services/supplierService";
import { useAuth } from "../context/AuthContext";
import "../styles/supplier.css";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: ""
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = search.trim()
        ? await supplierService.search(search.trim())
        : await supplierService.getAll();

      setSuppliers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadSuppliers();
  };

  const handleClearSearch = async () => {
    setSearch("");
    try {
      setLoading(true);
      setError("");
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingSupplier(null);
    setFormData(initialFormData);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);

    setFormData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      gstNumber: supplier.gstNumber || ""
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
    setFormData(initialFormData);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
        setMessage("Supplier updated successfully.");
      } else {
        await supplierService.create(formData);
        setMessage("Supplier created successfully.");
      }

      closeForm();
      await loadSuppliers();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.fieldErrors) {
        setError("Please check the entered values.");
      } else {
        setError(
          editingSupplier
            ? "Unable to update supplier."
            : "Unable to create supplier."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${supplier.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await supplierService.deactivate(supplier.id);

      setMessage("Supplier deactivated successfully.");
      await loadSuppliers();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to deactivate supplier.");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage pharmacy medicine suppliers.</p>
        </div>

        {isAdmin && (
          <button className="primary-button" onClick={openAddForm}>
            + Add Supplier
          </button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}

      {error && <div className="error-message">{error}</div>}

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Supplier List</h2>
            <p>View and manage all suppliers.</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search supplier..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button type="submit" className="secondary-button">
              Search
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          </form>
        </div>

        {loading ? (
          <div className="empty-state">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">No suppliers found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>GST Number</th>
                  <th>Status</th>
                  {isAdmin && <th>Number of Purchases</th>}
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone || "-"}</td>
                    <td>{supplier.email || "-"}</td>
                    <td>{supplier.gstNumber || "-"}</td>

                    <td>
                      <span
                        className={
                          supplier.status === "ACTIVE"
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {supplier.status}
                      </span>
                    </td>
                    {isAdmin && <td>{supplier.numberOfPurchases}</td>}

                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="secondary-button"
                            onClick={() => openEditForm(supplier)}
                          >
                            Edit
                          </button>

                          {supplier.status === "ACTIVE" && (
                            <button
                              className="danger-button"
                              onClick={() => handleDeactivate(supplier)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                </h2>
                <p>
                  {editingSupplier
                    ? "Update supplier information."
                    : "Enter supplier information."}
                </p>
              </div>

              <button className="modal-close" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="20"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength="150"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  maxLength="30"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength="500"
                  rows="3"
                />
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
                  {saving
                    ? "Saving..."
                    : editingSupplier
                      ? "Update Supplier"
                      : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;