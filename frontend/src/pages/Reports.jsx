
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; import api from "../services/api";
import demandService from "../services/demandService";
import BarChart from "../components/BarChart";
import "./Reports.css";

const tabs = [
  { id: "sales", label: "Sales" },
  { id: "purchases", label: "Purchases" },
  { id: "inventory", label: "Inventory" },
  { id: "demand", label: "Demand" },
];

const todayString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const monthStartString = () => `${todayString().slice(0, 7)}-01`;

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function number(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function ErrorMessage({ children }) {
  return <p className="reports-error">{children}</p>;
}

function LoadingMessage() {
  return <p className="reports-message">Loading report...</p>;
}

function Kpi({ label, value }) {
  return (
    <article className="reports-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Table({ columns, rows, rowKey, emptyMessage }) {
  if (!rows?.length) {
    return <p className="reports-message">{emptyMessage}</p>;
  }

  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row) : index}>
              {columns.map((column) => (
                <td key={column.label}>
                  {column.render
                    ? column.render(row)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DateFilters({ from, to, setFrom, setTo, onApply }) {
  return (
    <form
      className="reports-filters"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <label>
        From
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
          required
        />
      </label>

      <label>
        To
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
          required
        />
      </label>

      <button type="submit" className="reports-primary">
        Apply dates
      </button>
    </form>
  );
}

function DemandReport({ initialTab = "overview" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const demandTabs = [
    { id: "overview", label: "Demand Overview" },
    { id: "fast", label: "Fast-moving" },
    { id: "slow", label: "Slow-moving" },
    { id: "reorder", label: "Reorder Recommendations" },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, reportRows] = await Promise.all([
        demandService.getSummary(),
        activeTab === "fast"
          ? demandService.getFastMoving()
          : activeTab === "slow"
            ? demandService.getSlowMoving()
            : activeTab === "reorder"
              ? demandService.getReorder()
              : Promise.resolve([]),
      ]);

      setSummary(summaryData);
      setRows(reportRows);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load demand reports."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <nav className="reports-subtabs" aria-label="Demand report tabs">
        {demandTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {summary && (
        <div className="reports-kpis">
          <Kpi label="Demand window" value={`${summary.demandWindowDays} days`} />
          <Kpi label="Medicines analysed" value={number(summary.medicinesAnalysed)} />
          <Kpi label="Medicines sold" value={number(summary.medicinesSold)} />
          <Kpi label="Reorder recommendations" value={number(summary.reorderCount)} />
          <Kpi label="Fast-moving" value={number(summary.fastMovingCount)} />
          <Kpi label="Slow-moving" value={number(summary.slowMovingCount)} />
        </div>
      )}

      {activeTab === "overview" ? (
        <section className="reports-panel">
          <h2>Medicine Demand Analysis</h2>
          <p>
            Demand is calculated using completed sales over the configured{" "}
            {summary?.demandWindowDays ?? 30}-day demand window.
          </p>
          <p>
            Use the tabs above to inspect fast-moving medicines, slow-moving
            medicines, and reorder recommendations.
          </p>
        </section>
      ) : loading ? (
        <LoadingMessage />
      ) : (
        <section className="reports-panel">
          <h2>{demandTabs.find((tab) => tab.id === activeTab)?.label}</h2>
          <Table
            rows={rows}
            rowKey={(item) => item.medicineId}
            emptyMessage="No medicines match this report."
            columns={[
              {
                label: "Medicine",
                render: (item) => (
                  <>
                    <strong>{item.medicineName}</strong>
                    <small className="reports-cell-small">ID: {item.medicineId}</small>
                  </>
                ),
              },
              { label: "Sold", render: (item) => number(item.soldQty) },
              { label: "Daily demand", render: (item) => number(item.avgDaily) },
              { label: "Available", render: (item) => number(item.availableQty) },
              { label: "Reorder point", render: (item) => number(item.reorderPoint) },
              {
                label: "Days remaining",
                render: (item) =>
                  item.daysRemaining < 0
                    ? "No sales history"
                    : `${item.daysRemaining} days`,
              },
              {
                label: "Suggested qty",
                render: (item) => number(item.suggestedQty),
              },
              {
                label: "Action",
                render: (item) =>
                  activeTab === "reorder" && item.reorderRecommended ? (
                    <Link
                      className="reports-action"
                      to={`/purchases/new?medicineId=${item.medicineId}`}
                    >
                      Create purchase
                    </Link>
                  ) : "—",
              },
            ]}
          />
        </section>
      )}
    </>
  );
}

export default function Reports() {
  const [searchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const requestedDemandTab = searchParams.get("demandTab");

  const [activeTab, setActiveTab] = useState(() =>
    tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : "sales"
  );

  useEffect(() => {
    setActiveTab(
      tabs.some((tab) => tab.id === requestedTab)
        ? requestedTab
        : "sales"
    );
  }, [requestedTab]);

  const demandTab = ["overview", "fast", "slow", "reorder"].includes(
    requestedDemandTab
  )
    ? requestedDemandTab
    : "overview";
  const [from, setFrom] = useState(monthStartString);
  const [to, setTo] = useState(todayString);
  const [groupBy, setGroupBy] = useState("DAY");
  const [expiringDays, setExpiringDays] = useState("30");

  const [sales, setSales] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [supplierRows, setSupplierRows] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const loadReport = useCallback(async () => {
    if (activeTab === "demand") return;

    setLoading(true);
    setError("");

    try {
      if (activeTab === "sales") {
        const response = await api.get("/reports/sales", {
          params: { from, to, groupBy },
        });
        setSales(response.data);
      } else if (activeTab === "purchases") {
        const [purchaseResponse, supplierResponse] = await Promise.all([
          api.get("/reports/purchases", { params: { from, to } }),
          api.get("/reports/purchases-by-supplier", { params: { from, to } }),
        ]);

        setPurchases(purchaseResponse.data);
        setSupplierRows(supplierResponse.data ?? []);
      } else if (activeTab === "inventory") {
        const response = await api.get("/reports/inventory", {
          params: { expiringDays: Number(expiringDays) },
        });
        setInventory(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load this report. Check the backend and date range."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to, groupBy, expiringDays, reload]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <main className="reports-page">
      <header className="reports-heading">
        <div>
          <p className="reports-breadcrumb">Home / Reports</p>
          <h1>Reports</h1>
          <p>Review sales, purchasing, inventory, and medicine demand.</p>
        </div>

        <div className="reports-heading-actions">
          <button
            type="button"
            className="reports-refresh"
            onClick={() => window.print()}
          >
            Print report
          </button>
          <button
            type="button"
            className="reports-refresh"
            disabled={loading || activeTab === "demand"}
            onClick={() => setReload((value) => value + 1)}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <nav className="reports-tabs" aria-label="Report categories">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => changeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "demand" ? (
        <DemandReport
          key={demandTab}
          initialTab={demandTab}
        />
      ) : (
        <>
          {(activeTab === "sales" || activeTab === "purchases") && (
            <DateFilters
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              onApply={() => setReload((value) => value + 1)}
            />
          )}

          {activeTab === "inventory" && (
            <div className="reports-filters">
              <label>
                Expiring within
                <select
                  value={expiringDays}
                  onChange={(event) => setExpiringDays(event.target.value)}
                >
                  <option value="7">7 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              </label>
            </div>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {loading && <LoadingMessage />}

          {!loading && !error && activeTab === "sales" && sales && (
            <>
              <div className="reports-kpis">
                <Kpi label="Total sales" value={money(sales.totalSales)} />
                <Kpi label="Transactions" value={number(sales.transactionCount)} />
                <Kpi label="Grouping" value={sales.groupBy} />
              </div>

              <section className="reports-panel">
                <div className="reports-panel-heading">
                  <h2>Sales Trend</h2>
                  <label className="reports-inline-filter">
                    Group by
                    <select
                      value={groupBy}
                      onChange={(event) => setGroupBy(event.target.value)}
                    >
                      <option value="DAY">Day</option>
                      <option value="WEEK">Week</option>
                      <option value="MONTH">Month</option>
                    </select>
                  </label>
                </div>

                <BarChart
                  title="Sales by period"
                  data={(sales.data ?? []).map((item) => ({
                    label: item.label,
                    value: Number(item.totalSales ?? 0),
                  }))}
                  valuePrefix="₹"
                />
              </section>

              <section className="reports-panel">
                <h2>Sales Details</h2>
                <Table
                  rows={sales.data ?? []}
                  rowKey={(item) => item.label}
                  emptyMessage="No completed sales were found for this date range."
                  columns={[
                    { label: "Period", key: "label" },
                    { label: "Sales total", render: (item) => money(item.totalSales) },
                    { label: "Transactions", render: (item) => number(item.transactionCount) },
                  ]}
                />
              </section>
            </>
          )}

          {!loading && !error && activeTab === "purchases" && purchases && (
            <>
              <div className="reports-kpis">
                <Kpi label="Received purchase total" value={money(purchases.totalAmount)} />
                <Kpi label="Purchase count" value={number(purchases.purchaseCount)} />
              </div>

              <section className="reports-panel">
                <h2>Purchases by Supplier</h2>
                <Table
                  rows={supplierRows}
                  rowKey={(item) => item.supplierId}
                  emptyMessage="No received purchases were found for this date range."
                  columns={[
                    { label: "Supplier", key: "supplierName" },
                    { label: "Purchase count", render: (item) => number(item.purchaseCount) },
                    { label: "Total amount", render: (item) => money(item.totalAmount) },
                  ]}
                />
              </section>
            </>
          )}

          {!loading && !error && activeTab === "inventory" && inventory && (
            <>
              <div className="reports-kpis">
                <Kpi label="Active medicines" value={number(inventory.totalMedicines)} />
                <Kpi label="Total stock quantity" value={number(inventory.totalStockQuantity)} />
                <Kpi label="Available stock" value={number(inventory.availableStockQuantity)} />
                <Kpi label="Inventory value" value={money(inventory.inventoryValue)} />
                <Kpi label="Low-stock medicines" value={number(inventory.lowStockMedicines)} />
                <Kpi label="Out-of-stock medicines" value={number(inventory.outOfStockMedicines)} />
                <Kpi label="Expired batches" value={number(inventory.expiredBatchCount)} />
                <Kpi label="Expiring batches" value={number(inventory.expiringBatchCount)} />
              </div>

              <section className="reports-panel">
                <h2>Current Inventory</h2>
                <Table
                  rows={inventory.inventory ?? []}
                  rowKey={(item) => item.medicineId}
                  emptyMessage="No active medicines found."
                  columns={[
                    { label: "Medicine", key: "medicineName" },
                    { label: "Category", key: "categoryName" },
                    { label: "Total qty", render: (item) => number(item.totalQty) },
                    { label: "Available qty", render: (item) => number(item.availableQty) },
                    { label: "Expired qty", render: (item) => number(item.expiredQty) },
                    { label: "Stock value", render: (item) => money(item.stockValue) },
                    { label: "Status", key: "status" },
                  ]}
                />
              </section>

              <section className="reports-panel">
                <h2>Low Stock</h2>
                <Table
                  rows={inventory.lowStockItems ?? []}
                  rowKey={(item) => item.medicineId}
                  emptyMessage="No low-stock medicines."
                  columns={[
                    { label: "Medicine", key: "medicineName" },
                    { label: "Available qty", key: "availableQty" },
                    { label: "Reorder level", key: "reorderLevel" },
                  ]}
                />
              </section>

              <section className="reports-panel">
                <h2>Out of Stock</h2>
                <Table
                  rows={inventory.outOfStockItems ?? []}
                  rowKey={(item) => item.medicineId}
                  emptyMessage="No out-of-stock medicines."
                  columns={[
                    { label: "Medicine", key: "medicineName" },
                    { label: "Category", key: "categoryName" },
                    { label: "Status", key: "status" },
                  ]}
                />
              </section>

              <section className="reports-panel">
                <h2>Expired Batches</h2>
                <Table
                  rows={inventory.expiredBatches ?? []}
                  rowKey={(item) => item.batchId}
                  emptyMessage="No expired batches with remaining stock."
                  columns={[
                    { label: "Medicine", key: "medicineName" },
                    { label: "Batch", key: "batchNumber" },
                    { label: "Expiry date", key: "expiryDate" },
                    { label: "Quantity", key: "quantity" },
                  ]}
                />
              </section>

              <section className="reports-panel">
                <h2>Expiring Batches</h2>
                <Table
                  rows={inventory.expiringBatches ?? []}
                  rowKey={(item) => item.batchId}
                  emptyMessage={`No batches expiring within ${expiringDays} days.`}
                  columns={[
                    { label: "Medicine", key: "medicineName" },
                    { label: "Batch", key: "batchNumber" },
                    { label: "Expiry date", key: "expiryDate" },
                    { label: "Days remaining", key: "daysRemaining" },
                    { label: "Quantity", key: "quantity" },
                  ]}
                />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
