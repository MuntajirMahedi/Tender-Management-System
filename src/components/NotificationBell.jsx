import { useEffect, useState } from "react";
import { notificationApi } from "../api";
import { formatDateTime } from "../utils/formatters";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [{ notifications }, { unreadCount }] = await Promise.all([
        notificationApi.getNotifications({ limit: 10 }),
        notificationApi.getUnreadCount()
      ]);
      setItems(notifications || []);
      setUnread(unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30000);
    return () => clearInterval(id);
  }, []);

  const togglePanel = () => {
    setOpen((prev) => !prev);
    if (!open && unread > 0) {
      notificationApi.markAllRead().then(() => setUnread(0));
    }
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-light position-relative"
        onClick={togglePanel}
      >
        <i className="bi bi-bell" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="notifications-panel">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0">Notifications</h6>
            <button
              className="btn btn-link btn-sm text-decoration-none"
              onClick={loadNotifications}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </button>
          </div>
          {loading && <div className="text-muted small">Loading...</div>}
          {!loading && items.length === 0 && (
            <p className="text-muted small mb-0">You are all caught up!</p>
          )}
          <div className="list-group list-group-flush">
            {items.map((item) => (
              <div key={item.id} className="list-group-item px-0">
                <div className="fw-semibold">{item.title}</div>
                <div className="text-muted small">{item.message}</div>
                <div className="text-muted small">
                  {formatDateTime(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

