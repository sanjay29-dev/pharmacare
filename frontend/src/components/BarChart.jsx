
import "./BarChart.css";

export default function BarChart({
  data = [],
  title = "Overview",
  valuePrefix = "₹",
}) {
  const validData = data.filter(
    (item) => Number.isFinite(Number(item.value))
  );

  const maxValue = Math.max(
    0,
    ...validData.map((item) => Number(item.value))
  );

  const getHeight = (value) => {
    if (maxValue === 0) return 0;

    return Math.max(
      3,
      (Number(value) / maxValue) * 100
    );
  };

  const formatValue = (value) =>
    `${valuePrefix}${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="bar-chart-card">
      <div className="bar-chart-header">
        <h3>{title}</h3>
        <span className="bar-chart-subtitle">
          {validData.length} data points
        </span>
      </div>

      {validData.length === 0 ? (
        <div className="bar-chart-empty">
          No data available for this period.
        </div>
      ) : (
        <>
          <div className="bar-chart-plot">
            {validData.map((item, index) => (
              <div
                className="bar-chart-column"
                key={`${item.label}-${index}`}
                title={`${item.label}: ${formatValue(item.value)}`}
              >
                <span className="bar-chart-value">
                  {formatValue(item.value)}
                </span>

                <div className="bar-chart-bar-area">
                  <div
                    className="bar-chart-bar"
                    style={{
                      height: `${getHeight(item.value)}%`,
                    }}
                  />
                </div>

                <span className="bar-chart-label">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="bar-chart-footer">
            <span>Maximum</span>
            <strong>{formatValue(maxValue)}</strong>
          </div>
        </>
      )}
    </section>
  );
}
