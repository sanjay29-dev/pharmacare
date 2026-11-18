import "./StatusBadge.css";

const StatusBadge = ({ status }) => {

  const normalizedStatus = status || "NORMAL";

  const label = normalizedStatus
    .replaceAll("_", " ");

  return (
    <span className={`status-badge ${normalizedStatus.toLowerCase()}`}>
      {label}
    </span>
  );
};

export default StatusBadge;