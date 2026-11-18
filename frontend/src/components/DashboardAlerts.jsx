
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./DashboardAlerts.css";

export default function DashboardAlerts() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api.get("/dashboard/summary")
      .then((response) => {
        if (mounted) {
          setSummary(response.data);
        }
      })
      .catch((err) => {
        console.error("Dashboard summary error:", err);

        if (mounted) {
          setError("Unable to load dashboard summary.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <p className="dashboard-alert-error">
        {error}
      </p>
    );
  }

  if (!summary) {
    return (
      <p className="dashboard-alert-loading">
        Loading stock summary...
      </p>
    );
  }

  const cards = [
    {
      label: "Active Medicines",
      value: summary.activeMedicineCount,
      color: "blue",
      icon: "▦",
      link: "/medicines",
      visible: true,
    },
    {
      label: "Low Stock",
      value: summary.lowStockCount,
      color: "amber",
      icon: "!",
      link: "/inventory?filter=low-stock",
      visible: summary.lowStockAlertEnabled,
    },
    {
      label: "Out of Stock",
      value: summary.outOfStockCount,
      color: "red",
      icon: "×",
      link: "/inventory?filter=out-of-stock",
      visible: true,
    },
    {
      label: "Expired Batches",
      value: summary.expiredBatchCount,
      color: "red",
      icon: "⌛",
      link: "/expiry?filter=expired",
      visible: summary.expiryAlertEnabled,
    },
    {
      label: `Expiring Within ${summary.expiryAlertDays} Days`,
      value: summary.expiringSoonBatchCount,
      color: "amber",
      icon: "◷",
      link: `/expiry?filter=expiring-soon&days=${summary.expiryAlertDays}`,
      visible: summary.expiryAlertEnabled,
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

  return (
    <section className="dashboard-stock-section">
      <div className="dashboard-stock-heading">
        <div>
          <h2>Stock Overview</h2>
          <p>Current inventory and expiry alerts</p>
        </div>

        <Link to="/expiry">Manage Expiry →</Link>
      </div>

      <div className="dashboard-stock-grid">
        {visibleCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="dashboard-stock-card"
          >
            <div className={`dashboard-stock-icon ${card.color}`}>
              {card.icon}
            </div>

            <div className="dashboard-stock-label">
              {card.label}
            </div>

            <div className="dashboard-stock-value">
              {card.value}
            </div>

            <div className="dashboard-stock-link">
              View details →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
