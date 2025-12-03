import dayjs from "dayjs";
import { STATUS_COLORS } from "./constants";

/* -----------------------------------------
   ₹ Indian Currency Formatter (GLOBAL FIX)
----------------------------------------- */
export const formatCurrency = (value = 0) =>
  "₹" +
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

/* -----------------------------------------
   Number formatting (1,23,456)
----------------------------------------- */
export const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

/* -----------------------------------------
   Date Formats
----------------------------------------- */
export const formatDate = (value, format = "DD MMM YYYY") =>
  value ? dayjs(value).format(format) : "NA";

export const formatDateTime = (value, format = "DD MMM, YYYY hh:mm A") =>
  value ? dayjs(value).format(format) : "NA";

/* -----------------------------------------
   Status badge class
----------------------------------------- */
export const statusClass = (status) =>
  `badge text-bg-${STATUS_COLORS[status] || STATUS_COLORS.default}`;

/* -----------------------------------------
   Address composer
----------------------------------------- */
export const composeAddress = (entity = {}) =>
  [
    entity.addressLine1,
    entity.addressLine2,
    entity.city,
    entity.state,
    entity.pincode,
  ]
    .filter(Boolean)
    .join(", ");

/* -----------------------------------------
   Download file helper
----------------------------------------- */
export const downloadFileFromUrl = (url, filename = "download") => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
};
