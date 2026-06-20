import { useState, useEffect } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ===== LOAD NOTIFICATIONS =====
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // ===== MARK AS READ =====
  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  // ===== MARK ALL AS READ =====
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  // ===== DELETE NOTIFICATION =====
  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  // ===== ADD NOTIFICATION (called from Admin) =====
  const addNotification = (title, message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      time: new Date().toLocaleString(),
      date: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
    
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  return (
    <div
      style={{
        background: "#0a0a0f",
        color: "white",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 0",
          borderBottom: "2px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        <h2 style={{ margin: 0, color: "#fbbf24", fontSize: "20px" }}>
          🔔 Notifications
        </h2>
        {unreadCount > 0 && (
          <span
            style={{
              background: "#ef4444",
              color: "white",
              padding: "2px 10px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {unreadCount} new
          </span>
        )}
      </div>

      {/* ===== BUTTONS ===== */}
      {notifications.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          <button
            onClick={markAllAsRead}
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#8b5cf6",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Mark All Read
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete all notifications?")) {
                setNotifications([]);
                localStorage.setItem('notifications', JSON.stringify([]));
                setUnreadCount(0);
              }
            }}
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              border: "1px solid #ef4444",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* ===== NOTIFICATION LIST ===== */}
      {notifications.length === 0 ? (
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: "20px",
            padding: "50px 20px",
            textAlign: "center",
            border: "1px solid #2a2a4a",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>🔕</div>
          <h4 style={{ color: "#94a3b8", margin: "10px 0" }}>No Notifications</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              background: notif.read ? "#1a1a2e" : "rgba(139, 92, 246, 0.15)",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "10px",
              border: notif.read ? "1px solid #2a2a4a" : "1px solid #8b5cf6",
              cursor: notif.read ? "default" : "pointer",
              transition: "all 0.3s",
            }}
            onClick={() => {
              if (!notif.read) {
                markAsRead(notif.id);
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!notif.read && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#8b5cf6",
                        display: "inline-block",
                      }}
                    />
                  )}
                  <strong style={{ fontSize: "15px", color: "#fbbf24" }}>
                    {notif.title}
                  </strong>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0" }}>
                  {notif.message}
                </p>
                <span style={{ color: "#64748b", fontSize: "11px" }}>
                  {notif.time}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#64748b";
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* ===== BACK BUTTON ===== */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <a
          href="/dashboard"
          style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "13px",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#94a3b8")}
          onMouseLeave={(e) => (e.target.style.color = "#64748b")}
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default Notifications;