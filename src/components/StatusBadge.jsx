import clsx from "clsx";
import { STATUS_COLORS } from "../utils/constants";

const StatusBadge = ({ status }) => (
  <span className={clsx("badge", `text-bg-${STATUS_COLORS[status] || "secondary"}`)}>
    {status}
  </span>
);

export default StatusBadge;

