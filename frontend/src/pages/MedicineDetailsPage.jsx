import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import medicineService from "../services/medicineService";
import StatusBadge from "../components/StatusBadge";
import "./MedicineDetails.css";


const MedicineDetailsPage = () => {
  const { id } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await medicineService.getDetails(id);
      setDetails(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load medicine details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    return new Date(dateTime).toLocaleString("en-IN");
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Loading medicine details...
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="page-container">
        <div className="message error">
          {message}
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Medicine not found.
        </div>
      </div>
    );
  }

  const medicine = details.medicine;
  const stock = details.stockStatus;
  const batches = details.batches || [];
  const transactions = details.transactions || [];

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <Link to="/medicines" className="back-link">
            ← Back to Medicines
          </Link>

          <h1>{medicine.name}</h1>

          <p>
            {medicine.genericName || "Medicine details and stock information"}
          </p>
        </div>
      </div>

      <div className="details-grid">

        <div className="details-card">
          <h2>Medicine Information</h2>

          <div className="details-list">

            <div>
              <span>Category</span>
              <strong>{medicine.categoryName}</strong>
            </div>

            <div>
              <span>Manufacturer</span>
              <strong>{medicine.manufacturer || "-"}</strong>
            </div>

            <div>
              <span>Barcode</span>
              <strong>{medicine.barcode || "-"}</strong>
            </div>

            <div>
              <span>Reorder Level</span>
              <strong>{medicine.reorderLevel}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{medicine.status}</strong>
            </div>

          </div>
        </div>

        <div className="details-card">
          <h2>Stock Summary</h2>

          <div className="details-list">

            <div>
              <span>Stock Status</span>
              <StatusBadge status={stock.status} />
            </div>

            <div>
              <span>Total Quantity</span>
              <strong>{stock.totalQty}</strong>
            </div>

            <div>
              <span>Available Quantity</span>
              <strong>{stock.availableQty}</strong>
            </div>

            <div>
              <span>Expired Quantity</span>
              <strong>{stock.expiredQty}</strong>
            </div>

            <div>
              <span>Earliest Expiry</span>
              <strong>{formatDate(stock.earliestExpiry)}</strong>
            </div>

          </div>
        </div>

      </div>

      <div className="table-card details-section">

        <div className="section-header">
          <div>
            <h2>Batches</h2>
            <p>Batch-wise stock and expiry information.</p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="empty-state">
            No batches found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Manufacturing Date</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>MRP</th>
                </tr>
              </thead>

              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>

                    <td>
                      <strong>{batch.batchNumber}</strong>
                    </td>

                    <td>
                      {formatDate(batch.manufacturingDate)}
                    </td>

                    <td>
                      {formatDate(batch.expiryDate)}
                    </td>

                    <td>
                      {batch.quantity}
                    </td>

                    <td>
                      {formatMoney(batch.purchasePrice)}
                    </td>

                    <td>
                      {formatMoney(batch.sellingPrice)}
                    </td>

                    <td>
                      {formatMoney(batch.mrp)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

      <div className="table-card details-section">

        <div className="section-header">
          <div>
            <h2>Stock Transactions</h2>
            <p>Complete stock movement history.</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            No stock transactions found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Type</th>
                  <th>Quantity Change</th>
                  <th>Balance</th>
                  <th>Reference</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>

                    <td>
                      {formatDateTime(transaction.transactionDate)}
                    </td>

                    <td>
                      {transaction.batchNumber}
                    </td>

                    <td>
                      {transaction.type}
                    </td>

                    <td>
                      {transaction.quantityChange > 0
                        ? `+${transaction.quantityChange}`
                        : transaction.quantityChange}
                    </td>

                    <td>
                      {transaction.balanceAfter}
                    </td>

                    <td>
                      {transaction.reference || "-"}
                    </td>

                    <td>
                      {transaction.note || "-"}
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
};

export default MedicineDetailsPage;