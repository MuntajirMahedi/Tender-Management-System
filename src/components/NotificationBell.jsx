import { useEffect, useState } from "react";
import { notificationApi } from "../api";
import { formatDateTime } from "../utils/formatters";

const sortNotifications = (list) => {
  return [...(list || [])].sort((a, b) => {
    if (!!a.isRead === !!b.isRead) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isRead ? 1 : -1;
  });
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [{ notifications }, { unreadCount }] = await Promise.all([
        notificationApi.getNotifications({ limit: 50 }),
        notificationApi.getUnreadCount()
      ]);
      const sorted = sortNotifications(notifications || []);
      setItems(sorted);
      setUnread(unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const togglePanel = () => setOpen((prev) => !prev);
  const closePanel = () => setOpen(false);

  const handleMarkAllRead = async () => {
    if (!items.length || unread === 0) return;
    setMarkingAll(true);

    setItems((prev) =>
      sortNotifications(prev.map((n) => ({ ...n, isRead: true })))
    );
    setUnread(0);

    try {
      await notificationApi.markAllRead();
    } catch (err) {
      console.error("Failed to mark all read", err);
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id) => {
    setItems((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return sortNotifications(updated);
    });

    const target = items.find((n) => n.id === id);
    if (target && !target.isRead) {
      setUnread((prev) => Math.max(prev - 1, 0));
    }

    try {
      await notificationApi.markRead(id);
    } catch (err) {
      console.error("Failed to mark notification read", err);
      loadNotifications();
    }
  };

  const handleDelete = async (id) => {
    const target = items.find((n) => n.id === id);

    setItems((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) {
      setUnread((prev) => Math.max(prev - 1, 0));
    }

    try {
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification", err);
      loadNotifications();
    }
  };

  const hasNotifications = items.length > 0;
  const unreadItems = items.filter((n) => !n.isRead);
  const recentCount = unreadItems.length;
  const listToRender =
    activeTab === "recent" ? unreadItems : items;

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-light position-relative"
        onClick={togglePanel}
      >
        <i className="bi bi-bell" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* overlay */}
          <div className="notif-overlay" onClick={closePanel}></div>

          {/* sidebar */}
          <div
            className="notif-sidebar bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-bell-fill text-primary fs-4" />
                <h5 className="mb-0">Notifications</h5>
                {unread > 0 && (
                  <span className="badge rounded-pill bg-primary">{unread}</span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-link p-0 text-muted"
                onClick={closePanel}
              >
                <i className="bi bi-x-lg fs-5" />
              </button>
            </div>

            {hasNotifications && (
              <div className="d-flex justify-content-end mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifMarkAllRead"
                    onChange={handleMarkAllRead}
                    disabled={unread === 0 || markingAll}
                    checked={unread === 0 && hasNotifications}
                  />
                  <label
                    className="form-check-label small ms-1"
                    htmlFor="notifMarkAllRead"
                  >
                    Mark all read
                  </label>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="btn-group w-100 mb-3">
              <button
                type="button"
                className={`btn btn-sm w-50 ${
                  activeTab === "recent"
                    ? "btn-primary text-white"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                Recent ({recentCount})
              </button>

              <button
                type="button"
                className={`btn btn-sm w-50 ${
                  activeTab === "all"
                    ? "btn-primary text-white"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All ({items.length})
              </button>
            </div>

            {loading && (
              <div className="text-muted small mb-2">Loading...</div>
            )}

            {!loading && (!hasNotifications || listToRender.length === 0) && (
              <p className="text-muted small mb-0">You are all caught up!</p>
            )}

            {!loading && listToRender.length > 0 && (
              <div>
                {listToRender.map((item) => {
                  const isUnread = !item.isRead;
                  const initials =
                    (item.title || "?").trim().charAt(0).toUpperCase() || "?";

                  return (
                    <div
                      key={item.id}
                      className="card border-0 shadow-sm mb-3 notif-card"
                    >
                      <div className="card-body py-3 px-3">
                        <div className="d-flex gap-3">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: 36,
                              height: 36,
                              fontSize: "0.9rem"
                            }}
                          >
                            {initials}
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <p
                                className={`mb-0 ${
                                  isUnread ? "fw-semibold" : "text-muted"
                                }`}
                              >
                                {item.title}
                              </p>
                              <small className="text-muted ms-2">
                                {getRelativeTime(item.createdAt)}
                              </small>
                            </div>

                            <p className="mb-2 text-muted small">
                              {item.message}
                            </p>

                            {isUnread ? (
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 small"
                                onClick={() => handleMarkRead(item.id)}
                              >
                                <i className="bi bi-chevron-down me-1" />
                                Mark as read
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 small text-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="bi bi-trash me-1" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-muted small mt-1">
                          <i className="bi bi-clock me-1" />
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
