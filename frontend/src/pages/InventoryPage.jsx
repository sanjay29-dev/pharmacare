
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import inventoryService from "../services/inventoryService";
import StatusBadge from "../components/StatusBadge";
import "./Inventory.css";

const InventoryPage = () => {
  const [searchParams] = useSearchParams();

  const getFilterFromUrl = () => {
    const filter = searchParams.get("filter");

    if (filter === "low-stock") return "LOW_STOCK";
    if (filter === "out-of-stock") return "OUT_OF_STOCK";

    return "ALL";
  };

  const [inventory, setInventory] = useState([]);
  const [activeFilter, setActiveFilter] = useState(getFilterFromUrl);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Synchronize the selected filter with the URL.
  useEffect(() => {
    setActiveFilter(getFilterFromUrl());
  }, [searchParams]);

  const loadInventory = async (filter = "ALL") => {
    try {
      setLoading(true);
      setMessage("");

      let data;

      if (filter === "LOW_STOCK") {
        data = await inventoryService.getLowStock();
      } else if (filter === "OUT_OF_STOCK") {
        data = await inventoryService.getOutOfStock();
      } else {
        data = await inventoryService.getAll();
      }

      setInventory(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Monitor medicine stock, expiry and inventory value.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => loadInventory(activeFilter)}
        >
          Refresh
        </button>
      </div>

      <div className="filter-tabs">

        <button
          type="button"
          className={activeFilter === "ALL" ? "active" : ""}
          onClick={() => handleFilterChange("ALL")}
        >
          All
        </button>

        <button
          type="button"
          className={activeFilter === "LOW_STOCK" ? "active" : ""}
          onClick={() => handleFilterChange("LOW_STOCK")}
        >
          Low Stock
        </button>

        <button
          type="button"
          className={activeFilter === "OUT_OF_STOCK" ? "active" : ""}
          onClick={() => handleFilterChange("OUT_OF_STOCK")}
        >
          Out of Stock
        </button>

      </div>

      {message && (
        <div className="message error">
          {message}
        </div>
      )}

      <div className="table-card">

        {loading ? (
          <div className="empty-state">
            Loading inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="empty-state">
            No inventory records found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Reorder Level</th>
                  <th>Total Qty</th>
                  <th>Available Qty</th>
                  <th>Expired Qty</th>
                  <th>Earliest Expiry</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => (
                  <tr key={item.medicineId}>

                    <td>
                      <strong>{item.medicineName}</strong>

                      {item.genericName && (
                        <div className="table-secondary-text">
                          {item.genericName}
                        </div>
                      )}
                    </td>

                    <td>
                      {item.categoryName || "-"}
                    </td>

                    <td>
                      {item.manufacturer || "-"}
                    </td>

                    <td>
                      {item.reorderLevel}
                    </td>

                    <td>
                      {item.totalQty}
                    </td>

                    <td>
                      <strong>{item.availableQty}</strong>
                    </td>

                    <td>
                      {item.expiredQty}
                    </td>

                    <td>
                      {formatDate(item.earliestExpiry)}
                    </td>

                    <td>
                      {formatMoney(item.stockValue)}
                    </td>

                    <td>
                      <StatusBadge status={item.status} />

                      <div className="table-flags">

                        {item.hasExpiredBatch && (
                          <span className="table-flag expired">
                            Expired
                          </span>
                        )}

                        {item.hasExpiringSoonBatch && (
                          <span className="table-flag expiring">
                            Expiring Soon
                          </span>
                        )}

                      </div>
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

export default InventoryPage;
