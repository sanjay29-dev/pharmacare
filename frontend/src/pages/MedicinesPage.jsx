import { useEffect, useState } from "react";

import medicineService from "../services/medicineService";
import categoryService from "../services/categoryService";
import "../styles/medicine.css";
import { useAuth } from "../context/AuthContext";

function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("medicines");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    categoryId: "",
    manufacturer: "",
    barcode: "",
    reorderLevel: 10,
    description: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const data = search.trim()
        ? await medicineService.search(search.trim())
        : await medicineService.getAll();

      setMedicines(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load categories.");
    }
  };

  const openCategoryForm = () => {
    setCategoryName("");
    setMessage("");
    setError("");
    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    if (!categorySaving) {
      setShowCategoryForm(false);
      setCategoryName("");
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setCategorySaving(true);
      setMessage("");
      setError("");

      await categoryService.create({ name });

      setMessage("Category created successfully.");
      setCategoryName("");
      setShowCategoryForm(false);

      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Unable to create category."
      );
    } finally {
      setCategorySaving(false);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadCategories();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadMedicines();
  };

  const clearSearch = async () => {
    setSearch("");

    try {
      setLoading(true);

      const data = await medicineService.getAll();

      setMedicines(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingMedicine(null);

    setFormData({
      name: "",
      genericName: "",
      categoryId: "",
      manufacturer: "",
      barcode: "",
      reorderLevel: 10,
      description: ""
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (medicine) => {
    setEditingMedicine(medicine);

    setFormData({
      name: medicine.name || "",
      genericName: medicine.genericName || "",
      categoryId: medicine.categoryId || "",
      manufacturer: medicine.manufacturer || "",
      barcode: medicine.barcode || "",
      reorderLevel: medicine.reorderLevel ?? 10,
      description: medicine.description || ""
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (!saving) {
      setShowForm(false);
      setEditingMedicine(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const request = {
        ...formData,
        categoryId: Number(formData.categoryId),
        reorderLevel: Number(formData.reorderLevel)
      };

      if (editingMedicine) {
        await medicineService.update(
          editingMedicine.id,
          request
        );

        setMessage("Medicine updated successfully.");
      } else {
        await medicineService.create(request);

        setMessage("Medicine created successfully.");
      }

      setShowForm(false);
      setEditingMedicine(null);

      await loadMedicines();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to save medicine.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (medicine) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${medicine.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await medicineService.deactivate(medicine.id);

      setMessage("Medicine deactivated successfully.");

      await loadMedicines();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to deactivate medicine.");
      }
    }
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Medicines</h1>
          <p>Manage medicines and their categories.</p>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={activeTab === "medicines" ? "tab active" : "tab"}
          onClick={() => setActiveTab("medicines")}
        >
          Medicines
        </button>

        <button
          type="button"
          className={activeTab === "categories" ? "tab active" : "tab"}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>

      {activeTab === "medicines" && (
        <section className="content-card">

          <div className="section-header">
            <div>
              <h2>Medicine List</h2>
              <p>{medicines.length} medicine(s)</p>
            </div>

            <div className="section-actions">

              <form
                className="search-form"
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <button type="submit">
                  Search
                </button>

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                  >
                    Clear
                  </button>
                )}
              </form>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openAddForm}
                >
                  Add Medicine
                </button>
              )}

            </div>
          </div>

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {loading ? (
            <p>Loading medicines...</p>
          ) : medicines.length === 0 ? (
            <p>No medicines found.</p>
          ) : (
            <div className="table-container">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Generic Name</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Barcode</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>

                  {medicines.map((medicine) => (

                    <tr key={medicine.id}>

                      <td>{medicine.name}</td>

                      <td>
                        {medicine.genericName || "-"}
                      </td>

                      <td>
                        {medicine.categoryName}
                      </td>

                      <td>
                        {medicine.manufacturer || "-"}
                      </td>

                      <td>
                        {medicine.barcode || "-"}
                      </td>

                      <td>
                        {medicine.reorderLevel}
                      </td>

                      <td>
                        {medicine.status}
                      </td>

                      {isAdmin && (
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => openEditForm(medicine)}
                            >
                              Edit
                            </button>

                            {medicine.status === "ACTIVE" && (
                              <button
                                type="button"
                                className="danger-button"
                                onClick={() => handleDeactivate(medicine)}
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

        </section>
      )}

      {activeTab === "categories" && (
  <section className="content-card">

    <div className="section-header">
      <div>
        <h2>Categories</h2>
        <p>{categories.length} categor(y/ies)</p>
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={openCategoryForm}
        >
          Add Category
        </button>
      )}
    </div>

    {message && (
      <p className="success-message">{message}</p>
    )}

    {error && (
      <p className="error-message">{error}</p>
    )}

    {isAdmin && showCategoryForm && (
      <form
        className="content-card"
        onSubmit={handleCategorySubmit}
      >
        <div className="form-group">
          <label htmlFor="categoryName">
            Category Name
          </label>

          <input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
            placeholder="e.g. Tablets"
            maxLength={100}
            required
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={closeCategoryForm}
            disabled={categorySaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={categorySaving}
          >
            {categorySaving
              ? "Saving..."
              : "Save Category"}
          </button>
        </div>
      </form>
    )}

    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </section>
)}

      {isAdmin && showForm && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingMedicine
                  ? "Edit Medicine"
                  : "Add Medicine"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label>Medicine Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>Generic Name</label>

                <input
                  type="text"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>Category</label>

                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>

                  ))}

                </select>

              </div>

              <div className="form-group">

                <label>Manufacturer</label>

                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>Barcode</label>

                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>Reorder Level</label>

                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />

              </div>

              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}

              <div className="modal-actions">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingMedicine
                      ? "Update Medicine"
                      : "Save Medicine"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default MedicinesPage;