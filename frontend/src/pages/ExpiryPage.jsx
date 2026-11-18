
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Expiry.css";

export default function ExpiryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [searchParams] = useSearchParams();

  const requestedFilter = searchParams.get("filter");
  const requestedDays = searchParams.get("days");

  const validRequestedDays =
    requestedDays &&
    Number.isInteger(Number(requestedDays)) &&
    Number(requestedDays) >= 1 &&
    Number(requestedDays) <= 365
      ? requestedDays
      : null;

  const getInitialView = () => {
    if (requestedFilter === "expired") return "expired";
    if (requestedFilter === "all") return "all";

    return "soon";
  };

  const [view, setView] = useState(getInitialView);

  const [days, setDays] = useState(
    validRequestedDays || "30"
  );

  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [writingOff, setWritingOff] = useState(null);

  // Synchronize expiry filters with dashboard URL links.
  useEffect(() => {
    if (requestedFilter === "expired") {
      setView("expired");
    } else if (requestedFilter === "all") {
      setView("all");
    } else {
      setView("soon");
    }

    if (validRequestedDays) {
      setDays(validRequestedDays);
    }
  }, [searchParams]);

  // Load the configured expiry warning period.
  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await api.get("/settings/inventory");

        if (!active) return;

        const configuredDays = Number(
          response.data.expiryAlertDays ?? 30
        );

        if (
          !validRequestedDays &&
          Number.isInteger(configuredDays) &&
          configuredDays >= 1 &&
          configuredDays <= 365
        ) {
          setDays(String(configuredDays));
        }
      } catch (err) {
        console.error("Unable to load inventory settings:", err);

        if (active) {
          setError(
            "Unable to load saved expiry settings. Using 30 days."
          );
        }
      } finally {
        if (active) {
          setSettingsLoaded(true);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  // Load expiry batches.
  const loadBatches = useCallback(async () => {
    if (!settingsLoaded && view === "soon") {
      return;
    }

    try {
      setLoading(true);
      setError("");

      let endpoint = "/expiry/expiring-soon";
      let params = { days: Number(days) };

      if (view === "expired") {
        endpoint = "/expiry/expired";
        params = {};
      } else if (view === "all") {
        endpoint = "/expiry/all";
        params = {};
      }

      const response = await api.get(endpoint, { params });

      setBatches(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Expiry loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load expiry records."
      );
    } finally {
      setLoading(false);
    }
  }, [view, days, settingsLoaded]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // Write off expired stock.
  async function handleWriteOff(batch) {
    if (!isAdmin) return;

    const reason = window.prompt(
      `Write off ${batch.quantity} units of ${batch.medicineName}, batch ${batch.batchNumber}?\nEnter the reason:`,
      "Expired stock"
    );

    if (!reason || !reason.trim()) return;

    try {
      setWritingOff(batch.batchId);
      setError("");
      setMessage("");

      await api.post(
        `/batches/${batch.batchId}/write-off`,
        null,
        {
          params: { reason: reason.trim() },
        }
      );

      setMessage(
        `Batch ${batch.batchNumber} was written off successfully.`
      );

      await loadBatches();
    } catch (err) {
      console.error("Write-off error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to write off this batch."
      );
    } finally {
      setWritingOff(null);
    }
  }

  function formatDate(value) {
    if (!value) return "—";

    return new Date(`${value}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function statusLabel(status) {
    return (status || "").replaceAll("_", " ");
  }

  return (
    <div className="ns-page expiry-page">
      <div className="ns-page-heading">
        <div>
          <div className="ns-breadcrumb">
            Home / Inventory / Expiry
          </div>

          <h1>Expiry Management</h1>

          <p>
            Monitor expiry dates and safely handle expired stock.
          </p>
        </div>

        <button
          type="button"
          className="ns-secondary-button"
          onClick={loadBatches}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="ns-alert ns-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="ns-alert ns-alert-success">
          {message}
        </div>
      )}

      <div className="expiry-tabs">
        <button
          type="button"
          className={view === "soon" ? "active" : ""}
          onClick={() => setView("soon")}
        >
          Expiring Soon
        </button>

        <button
          type="button"
          className={view === "expired" ? "active" : ""}
          onClick={() => setView("expired")}
        >
          Expired Stock
        </button>

        <button
          type="button"
          className={view === "all" ? "active" : ""}
          onClick={() => setView("all")}
        >
          All Batches
        </button>
      </div>

      {view === "soon" && (
        <div className="expiry-period">
          <label htmlFor="expiry-days">
            Show batches expiring within:
          </label>

          <select
            id="expiry-days"
            value={days}
            onChange={(event) => setDays(event.target.value)}
          >
            {[7, 30, 60, 90, 180].map((option) => (
              <option key={option} value={String(option)}>
                {option} days
              </option>
            ))}

            {![7, 30, 60, 90, 180].includes(Number(days)) && (
              <option value={days}>
                {days} days (Saved setting)
              </option>
            )}
          </select>
        </div>
      )}

      <section className="sh-table-card expiry-table-card">
        <div className="sh-table-heading">
          <h2>
            {view === "expired"
              ? "Expired Batches With Stock"
              : view === "all"
                ? "All Batch Expiry Records"
                : `Batches Expiring Within ${days} Days`}
          </h2>

          <span>{batches.length} batches</span>
        </div>

        {loading ? (
          <p className="sh-empty">
            Loading expiry records...
          </p>
        ) : batches.length === 0 ? (
          <div className="expiry-empty">
            <span>✓</span>
            <h3>No matching batches</h3>
            <p>No batches were found for this selection.</p>
          </div>
        ) : (
          <div className="sh-table-wrapper">
            <table className="sh-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Status</th>

                  {view === "expired" && isAdmin && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.batchId}>
                    <td>
                      <strong>{batch.medicineName}</strong>
                    </td>

                    <td>{batch.batchNumber}</td>

                    <td>{formatDate(batch.expiryDate)}</td>

                    <td>
                      {batch.daysRemaining < 0
                        ? `${Math.abs(batch.daysRemaining)} days overdue`
                        : batch.daysRemaining === 0
                          ? "Expires today"
                          : `${batch.daysRemaining} days`}
                    </td>

                    <td>{batch.quantity}</td>

                    <td>
                      ₹
                      {Number(
                        batch.purchasePrice || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`expiry-status expiry-${String(
                          batch.status
                        ).toLowerCase()}`}
                      >
                        {statusLabel(batch.status)}
                      </span>
                    </td>

                    {view === "expired" && isAdmin && (
                      <td>
                        <button
                          type="button"
                          className="expiry-writeoff-button"
                          disabled={
                            batch.quantity <= 0 ||
                            writingOff === batch.batchId
                          }
                          onClick={() => handleWriteOff(batch)}
                        >
                          {writingOff === batch.batchId
                            ? "Processing..."
                            : "Write Off"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="expiry-info">
        <strong>Stock safety:</strong> Writing off a batch sets its
        remaining quantity to zero and records an EXPIRED transaction.
        Expiry reports alone do not change stock.
      </div>
    </div>
  );
}
