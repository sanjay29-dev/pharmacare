
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./FindMedicine.css";

export default function FindMedicine() {
  const [keyword, setKeyword] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();

  async function handleSearch(event) {
    event.preventDefault();

    if (!keyword.trim()) {
      setMedicines([]);
      setSearched(false);
      setError("Enter a medicine name, generic name, or barcode.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await api.get("/medicines/search", {
        params: { keyword: keyword.trim() },
      });

      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setMedicines([]);
      setError(
        err.response?.data?.message ||
          "Unable to search medicines. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddToSale(medicine) {
    if (medicine.availableQty <= 0) {
      setError("This medicine has no available stock.");
      return;
    }

    addToCart(medicine);
    setError("");
  }

  return (
    <div className="find-medicine-page">
      <div className="find-medicine-header">
        <div>
          <h1>Find Medicine</h1>
          <p>Search medicines and add them to a customer sale.</p>
        </div>

        <button
          type="button"
          className="find-cart-button"
          onClick={() => navigate("/sales/new")}
        >
          New Sale ({cartCount})
        </button>
      </div>

      <form className="medicine-search-form" onSubmit={handleSearch}>
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search by medicine name, generic name, or barcode"
          aria-label="Search medicines"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="find-medicine-error">{error}</div>}

      <div className="find-medicine-results">
        <h2>Search Results</h2>

        {!searched && (
          <p className="find-medicine-message">
            Enter a search term to find medicines.
          </p>
        )}

        {searched && !loading && medicines.length === 0 && !error && (
          <p className="find-medicine-message">
            No medicines found for "{keyword}".
          </p>
        )}

        {medicines.length > 0 && (
          <div className="find-medicine-table-wrapper">
            <table className="find-medicine-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.medicineId}>
                    <td>
                      <strong>{medicine.name}</strong>
                      {medicine.barcode && (
                        <small className="medicine-barcode">
                          Barcode: {medicine.barcode}
                        </small>
                      )}
                    </td>
                    <td>{medicine.genericName || "—"}</td>
                    <td>{medicine.categoryName || "—"}</td>
                    <td>{medicine.manufacturer || "—"}</td>
                    <td>{medicine.availableQty}</td>
                    <td>
                      <span
                        className={`medicine-stock-status ${
                          medicine.stockStatus?.toLowerCase() || "unknown"
                        }`}
                      >
                        {medicine.stockStatus || "UNKNOWN"}
                      </span>
                      {medicine.hasExpiredBatch && (
                        <small className="medicine-warning">
                          Expired batch exists
                        </small>
                      )}
                      {medicine.hasExpiringSoonBatch && (
                        <small className="medicine-warning">
                          Batch expiring soon
                        </small>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="add-sale-button"
                        disabled={medicine.availableQty <= 0}
                        onClick={() => handleAddToSale(medicine)}
                      >
                        Add to Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
