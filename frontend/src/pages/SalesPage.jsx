
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import saleService from "../services/saleService";
import "./Sales.css";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSales() {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (fromDate) filters.from = `${fromDate}T00:00:00`;
      if (toDate) filters.to = `${toDate}T23:59:59`;

      const data = await saleService.search(filters);
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load sales history."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  function handleFilter(event) {
    event.preventDefault();

    if (fromDate && toDate && fromDate > toDate) {
      setError("The start date cannot be after the end date.");
      return;
    }

    loadSales();
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function currency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <div className="ns-page">
      <div className="ns-page-heading">
        <div>
          <div className="ns-breadcrumb">Home / Sales / History</div>
          <h1>Sales History</h1>
          <p>View completed sales and open their invoices.</p>
        </div>

        <Link className="sh-primary-link" to="/sales/new">
          + New Sale
        </Link>
      </div>

      <section className="sh-filter-card">
        <form onSubmit={handleFilter} className="sh-filter-form">
          <label>
            From Date
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label>
            To Date
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <button type="submit" className="ns-primary-button">
            Apply Filter
          </button>

          <button
            type="button"
            className="ns-secondary-button"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setTimeout(() => {
                setError("");
                setLoading(true);
                saleService
                  .getAll()
                  .then((data) => setSales(Array.isArray(data) ? data : []))
                  .catch(() => setError("Unable to load sales history."))
                  .finally(() => setLoading(false));
              }, 0);
            }}
          >
            Clear
          </button>
        </form>
      </section>

      {error && <div className="ns-alert ns-alert-error">{error}</div>}

      <section className="sh-table-card">
        <div className="sh-table-heading">
          <h2>Sales Records</h2>
          <span>{sales.length} records</span>
        </div>

        {loading ? (
          <p className="sh-empty">Loading sales...</p>
        ) : sales.length === 0 ? (
          <p className="sh-empty">No sales found for the selected dates.</p>
        ) : (
          <div className="sh-table-wrapper">
            <table className="sh-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber || `Sale #${sale.id}`}</strong>
                    </td>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td>{sale.customerName || "Walk-in"}</td>
                    <td>{sale.items?.length ?? "—"}</td>
                    <td className="sh-amount">
                      {currency(sale.totalAmount)}
                    </td>
                    <td>
                      <span className="sh-status">
                        {sale.status || "COMPLETED"}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="sh-view-link"
                        to={`/sales/${sale.id}`}
                      >
                        View Invoice →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
