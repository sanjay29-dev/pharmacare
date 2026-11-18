
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardAlerts from "../components/DashboardAlerts";
import BarChart from "../components/BarChart";
import "./Dashboard.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function KpiCard({ label, value, description }) {
  return (
    <article className="pro-kpi-card">
      <span className="pro-kpi-label">{label}</span>
      <strong className="pro-kpi-value">{value}</strong>
      <span className="pro-kpi-description">{description}</span>
    </article>
  );
}

function DataPanel({ title, link, linkText, children }) {
  return (
    <section className="pro-dashboard-panel">
      <div className="pro-panel-heading">
        <h2>{title}</h2>
        {link && <Link to={link}>{linkText || "View all"} →</Link>}
      </div>
      {children}
    </section>
  );
}

function LoadingMessage() {
  return <p className="pro-muted">Loading data...</p>;
}

function ErrorMessage() {
  return (
    <p className="pro-error">
      Unable to load this section. Check that the backend is running.
    </p>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [sales, setSales] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [fastMoving, setFastMoving] = useState(null);
  const [reorderItems, setReorderItems] = useState(null);
  const [expiringItems, setExpiringItems] = useState(null);

  const [expiryAlertEnabled, setExpiryAlertEnabled] = useState(true);
  const [expiryAlertDays, setExpiryAlertDays] = useState(30);

  const [salesError, setSalesError] = useState(false);
  const [chartError, setChartError] = useState(false);
  const [fastMovingError, setFastMovingError] = useState(false);
  const [reorderError, setReorderError] = useState(false);
  const [expiryError, setExpiryError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 6);

      const toIsoDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const from = toIsoDate(fromDate);
      const to = toIsoDate(today);

      // First retrieve saved inventory settings.
      let settings = null;

      try {
        const settingsResponse = await api.get("/dashboard/summary");

        settings = settingsResponse.data;

        if (!active) return;

        setExpiryAlertEnabled(
          settings.expiryAlertEnabled ?? true
        );

        setExpiryAlertDays(
          settings.expiryAlertDays ?? 30
        );
      } catch (err) {
        console.error("Dashboard settings error:", err);

        if (!active) return;

        setExpiryError(true);
      }

      // Load the remaining dashboard sections.
      const requests = [
        api.get("/dashboard/sales"),
        api.get("/dashboard/daily-sales", {
          params: { from, to },
        }),
        api.get("/dashboard/top-selling"),
        api.get("/dashboard/reorder"),
      ];

      // Load expiry data only when expiry alerts are enabled.
      if (settings?.expiryAlertEnabled !== false && settings) {
        requests.push(
          api.get("/expiry/expiring-soon", {
            params: {
              days: settings.expiryAlertDays ?? 30,
            },
          })
        );
      }

      const results = await Promise.allSettled(requests);

      if (!active) return;

      const [
        salesResult,
        chartResult,
        fastResult,
        reorderResult,
        expiryResult,
      ] = results;

      if (salesResult.status === "fulfilled") {
        setSales(salesResult.value.data);
      } else {
        setSalesError(true);
      }

      if (chartResult.status === "fulfilled") {
        const buckets = chartResult.value.data?.data ?? [];

        setDailySales(
          buckets.map((item) => ({
            label: item.label,
            value: Number(item.totalSales ?? 0),
          }))
        );
      } else {
        setChartError(true);
      }

      if (fastResult.status === "fulfilled") {
        setFastMoving(fastResult.value.data ?? []);
      } else {
        setFastMovingError(true);
      }

      if (reorderResult.status === "fulfilled") {
        setReorderItems(reorderResult.value.data ?? []);
      } else {
        setReorderError(true);
      }

      if (settings?.expiryAlertEnabled === false) {
        setExpiringItems([]);
      } else if (expiryResult?.status === "fulfilled") {
        setExpiringItems(expiryResult.value.data ?? []);
      } else {
        setExpiryError(true);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ns-page pro-dashboard">
      <div className="ns-page-heading">
        <div>
          <div className="ns-breadcrumb">Home / Dashboard</div>
          <h1>Dashboard</h1>
          <p>
            Sales performance, inventory health, and medicine demand.
          </p>
        </div>
      </div>

      {/* SALES OVERVIEW */}

      <section className="pro-dashboard-section">
        <div className="pro-section-heading">
          <div>
            <h2>Sales Overview</h2>
            <p>Completed sales transactions</p>
          </div>

          {isAdmin && <Link to="/reports">View reports →</Link>}
        </div>

        {salesError ? (
          <ErrorMessage />
        ) : !sales ? (
          <LoadingMessage />
        ) : (
          <div className="pro-kpi-grid">
            <KpiCard
              label="Today's Sales"
              value={formatCurrency(sales.todaySales)}
              description={`${sales.todayTransactions ?? 0} transactions today`}
            />

            <KpiCard
              label="This Week"
              value={formatCurrency(sales.weekSales)}
              description={`${sales.weekTransactions ?? 0} transactions this week`}
            />

            <KpiCard
              label="This Month"
              value={formatCurrency(sales.monthSales)}
              description={`${sales.monthTransactions ?? 0} transactions this month`}
            />
          </div>
        )}
      </section>

      {/* DAILY SALES CHART */}

      <section className="pro-dashboard-section">
        {chartError ? (
          <DataPanel title="Daily Sales — Last 7 Days">
            <ErrorMessage />
          </DataPanel>
        ) : (
          <BarChart
            title="Daily Sales — Last 7 Days"
            data={dailySales}
            valuePrefix="₹"
          />
        )}
      </section>

      {/* STOCK SUMMARY */}

      <section className="pro-dashboard-section">
        <DashboardAlerts />
      </section>

      {/* EXPIRY AND FAST-MOVING MEDICINES */}

      <div className="pro-dashboard-grid">

        {expiryAlertEnabled && (
          <DataPanel
            title={`Expiring Within ${expiryAlertDays} Days`}
            link="/expiry"
            linkText="Manage expiry"
          >
            {expiryError ? (
              <ErrorMessage />
            ) : !expiringItems ? (
              <LoadingMessage />
            ) : expiringItems.length === 0 ? (
              <p className="pro-success-message">
                No expiring batches found for this period.
              </p>
            ) : (
              <div className="pro-table-wrap">
                <table className="pro-data-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Qty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {expiringItems.slice(0, 5).map((item) => (
                      <tr key={item.batchId}>
                        <td>{item.medicineName}</td>
                        <td>{item.batchNumber}</td>
                        <td>{item.expiryDate}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataPanel>
        )}

        {/* FAST-MOVING MEDICINES */}

        <DataPanel
          title="Fast-Moving Medicines"
          link={isAdmin ? "/reports?tab=demand&demandTab=fast" : undefined}
          linkText="View reports"
        >
          {fastMovingError ? (
            <ErrorMessage />
          ) : !fastMoving ? (
            <LoadingMessage />
          ) : fastMoving.length === 0 ? (
            <p className="pro-muted">
              No medicine sales found in the demand window.
            </p>
          ) : (
            <div className="pro-list">
              {fastMoving.slice(0, 5).map((item) => (
                <div
                  className="pro-list-row"
                  key={item.medicineId}
                >
                  <div>
                    <strong>{item.medicineName}</strong>
                    <span>{item.soldQty} units sold</span>
                  </div>

                  <span className="pro-pill">
                    {item.availableQty} in stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </DataPanel>
      </div>

      {/* REORDER RECOMMENDATIONS */}

      <DataPanel
        title="Reorder Recommendations"
        link={isAdmin ? "/reports?tab=demand&demandTab=reorder" : undefined}
        linkText="Review demand"
      >
        {reorderError ? (
          <ErrorMessage />
        ) : !reorderItems ? (
          <LoadingMessage />
        ) : reorderItems.length === 0 ? (
          <p className="pro-success-message">
            No medicines currently require reordering.
          </p>
        ) : (
          <div className="pro-table-wrap">
            <table className="pro-data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Available</th>
                  <th>Reorder Point</th>
                  <th>Suggested Qty</th>
                </tr>
              </thead>

              <tbody>
                {reorderItems.slice(0, 8).map((item) => (
                  <tr key={item.medicineId}>
                    <td>{item.medicineName}</td>
                    <td>{item.availableQty}</td>
                    <td>{item.reorderPoint}</td>
                    <td>{item.suggestedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>
    </div>
  );
}
