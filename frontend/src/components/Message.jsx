
import "./Message.css";

function Message({ type = "info", children }) {
  return (
    <div className={`message message-${type}`}>
      {children}
    </div>
  );
}

export default Message;