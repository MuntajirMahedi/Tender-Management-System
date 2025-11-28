import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { notificationApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";

const sortNotifications = (list) => {
  return [...(list || [])].sort((a, b) => {
    if (!!a.isRead === !!b.isRead) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isRead ? 1 : -1;
  });
};

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      const sorted = sortNotifications(res.notifications || []);
      setItems(sorted);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleMarkSelectedRead = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);

    setItems((prev) =>
      sortNotifications(
        prev.map((n) =>
          selectedIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      )
    );

    try {
      await notificationApi.markBulkRead(selectedIds);
    } catch (err) {
      console.error("Failed to mark selected read", err);
      loadNotifications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!items.length) return;
    setBulkLoading(true);

    setItems((prev) =>
      sortNotifications(prev.map((n) => ({ ...n, isRead: true })))
    );
    try {
      await notificationApi.markAllRead();
    } catch (err) {
      console.error("Failed to mark all read", err);
      loadNotifications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);

    try {
      await Promise.all(
        selectedIds.map((id) => notificationApi.deleteNotification(id))
      );
      setItems((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to delete selected notifications", err);
      loadNotifications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    setBulkLoading(true);
    try {
      await notificationApi.deleteNotification(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
      loadNotifications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!items.length) return;

    setBulkLoading(true);
    try {
      if (notificationApi.deleteAllNotifications) {
        await notificationApi.deleteAllNotifications();
      } else {
        // fallback: delete one by one
        await Promise.all(
          items.map((n) => notificationApi.deleteNotification(n.id))
        );
      }
      setItems([]);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to delete all notifications", err);
      loadNotifications();
    } finally {
      setBulkLoading(false);
    }
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const hasUnread = items.some((n) => !n.isRead);
  const hasItems = items.length > 0;
  const canDeleteAll = hasItems && !hasUnread;

  return (
    <div>
      <PageHeader title="Notifications" subtitle="All alerts and reminders" />
      <div className="table-card p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="form-check mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                disabled={!items.length}
              />
              <label className="form-check-label small ms-1">
                Select all
              </label>
            </div>
            <small className="text-muted ms-2">
              {hasUnread
                ? `${items.filter((n) => !n.isRead).length} unread`
                : hasItems
                ? "All notifications are read"
                : ""}
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              onClick={handleMarkSelectedRead}
              disabled={!selectedIds.length || bulkLoading}
            >
              <i className="bi bi-check2-square me-1" />
              Mark selected read
            </button>
            <button
              className="btn btn-sm btn-outline-success"
              type="button"
              onClick={handleMarkAllRead}
              disabled={!hasUnread || bulkLoading}
            >
              <i className="bi bi-check2-all me-1" />
              Mark all read
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              type="button"
              onClick={handleDeleteSelected}
              disabled={!selectedIds.length || bulkLoading}
            >
              <i className="bi bi-trash me-1" />
              Delete selected
            </button>
            {canDeleteAll && (
              <button
                className="btn btn-sm btn-danger"
                type="button"
                onClick={handleDeleteAll}
                disabled={bulkLoading}
              >
                <i className="bi bi-trash-fill me-1" />
                Delete all
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center text-muted py-3">Loading...</div>
        )}

        {!loading && !hasItems && (
          <div className="text-center text-muted py-3">
            No notifications.
          </div>
        )}

        {!loading && hasItems && (
          <ul className="list-group list-group-flush">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isUnread = !item.isRead;
              return (
                <li
                  key={item.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    isUnread ? "bg-light" : ""
                  }`}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div className="form-check mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {isUnread && (
                          <span className="badge bg-primary rounded-circle p-1">
                            &nbsp;
                          </span>
                        )}
                        <span
                          className={
                            isUnread ? "fw-semibold" : "text-muted"
                          }
                        >
                          {item.title}
                        </span>
                      </div>
                      <div className="text-muted small">
                        {item.message}
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-muted small mb-1">
                      {formatDateTime(item.createdAt)}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => handleDeleteSingle(item.id)}
                      disabled={bulkLoading}
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {bulkLoading && (
          <div className="text-muted small mt-2">
            Applying changes…
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
