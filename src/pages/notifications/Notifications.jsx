import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { notificationApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";

const Notifications = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    notificationApi.getNotifications().then((res) => setItems(res.notifications || []));
  }, []);

  return (
    <div>
      <PageHeader title="Notifications" subtitle="All alerts and reminders" />
      <div className="table-card">
        <ul className="list-group list-group-flush">
          {items.map((item) => (
            <li key={item.id || item._id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{item.title}</div>
                  <div className="text-muted">{item.message}</div>
                </div>
                <small className="text-muted">{formatDateTime(item.createdAt)}</small>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="list-group-item text-center text-muted">
              No notifications.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;

