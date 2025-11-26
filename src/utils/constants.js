export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const AUTH_STORAGE_KEY = "tms_auth";

export const ROLE_ACCESS = {
  owner: "all",
  admin: [
    "dashboard",
    "inquiries",
    "clients",
    "plans",
    "payments",
    "invoices",
    "activation",
    "tickets",
    "renewals",
    "reports",
    "users",
    "roles",
    "permissions",
    "notifications",
    "documents",
    "audit",
    "settings"
  ],
  sales: [
    "dashboard",
    "inquiries",
    "clients",
    "plans",
    "payments",
    "invoices",
    "tickets",
    "renewals",
    "reports",
    "notifications",
    "documents",
    "settings"
  ],
  care: [
    "dashboard",
    "clients",
    "activation",
    "tickets",
    "payments",
    "invoices",
    "reports",
    "notifications",
    "documents",
    "settings"
  ],
  viewer: [
    "dashboard",
    "clients",
    "plans",
    "reports",
    "notifications",
    "settings"
  ]
};

export const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "bi-speedometer2"
  },
  {
    key: "inquiries",
    label: "Inquiries",
    path: "/inquiries",
    icon: "bi-question-circle"
  },
  {
    key: "clients",
    label: "Clients",
    path: "/clients",
    icon: "bi-people"
  },
  {
    key: "plans",
    label: "Plans",
    path: "/plans",
    icon: "bi-diagram-3"
  },
  {
    key: "payments-group",
    label: "Payments",
    icon: "bi-credit-card",
    children: [
      { key: "payments", label: "Payments", path: "/payments" },
      { key: "invoices", label: "Invoices", path: "/invoices" }
    ]
  },
  {
    key: "activation",
    label: "Activation",
    path: "/activation",
    icon: "bi-lightning-charge"
  },
  {
    key: "tickets",
    label: "Support",
    path: "/tickets",
    icon: "bi-headset"
  },
  {
    key: "renewals",
    label: "Renewals",
    path: "/renewals",
    icon: "bi-arrow-repeat"
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: "bi-bar-chart"
  },
  {
    key: "users",
    label: "Users & Roles",
    icon: "bi-person-badge",
    children: [
      { key: "users", label: "Users", path: "/users" },
      { key: "roles", label: "Roles", path: "/roles" },
      { key: "permissions", label: "Permissions", path: "/permissions" }
    ]
  },
  {
    key: "audit",
    label: "Audit Logs",
    path: "/audit-logs",
    icon: "bi-shield-lock"
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: "bi-gear"
  }
];

export const INQUIRY_STATUSES = [
  "New",
  "Prospect",
  "Cold",
  "Not Connected",
  "Following",
  "Converted",
  "Lost"
];
export const INQUIRY_INTEREST_LEVELS = ["Hot", "Warm", "Cold", "Unknown"];

export const CLIENT_STATUSES = ["Onboarding", "Active", "Inactive", "Hold"];

export const PLAN_TYPES = ["Tender", "GEM", "DC"];
export const PLAN_STATUSES = [
  "Pending Activation",
  "Active",
  "Expired",
  "Cancelled"
];
export const PAYMENT_STATUSES = ["Pending", "Partial", "Paid"];

export const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "IMPS",
  "NEFT",
  "RTGS",
  "Cheque",
  "Other"
];

export const ACTIVATION_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled"
];

export const TICKET_TYPES = ["Complaint", "Request", "Query", "Feedback"];
export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const RENEWAL_TYPES = ["ExtendSamePlan", "ChangePlan"];

export const STATUS_COLORS = {
  default: "secondary",
  New: "primary",
  Prospect: "info",
  "Not Connected": "warning",
  Following: "info",
  Converted: "success",
  Lost: "danger",
  "Pending Activation": "warning",
  Active: "success",
  Expired: "secondary",
  Cancelled: "danger",
  Pending: "warning",
  Partial: "info",
  Paid: "success",
  Open: "warning",
  "In Progress": "info",
  Resolved: "success",
  Closed: "secondary",
  "Onboarding": "primary",
  "Daily Sample": "info"
};

export const TABLE_PAGE_SIZES = [10, 20, 50, 100];

