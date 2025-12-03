// src/pages/plans/PlanForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, userApi } from "../../api";
import { PLAN_TYPES, PLAN_STATUSES } from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planType: yup.string().required("Plan type is required"),
  planName: yup.string().required("Plan name is required"),
  amount: yup.number().typeError("Amount must be a number").required("Amount is required"),
  assignedSales: yup.string().required("Sales owner is required"),
  startDate: yup.string().required("Start date is required"),
});

// Default Values
const defaultValues = {
  clientId: "",
  planName: "",
  planType: "Tender",
  amount: "",
  discount: 0,
  taxPercent: 18,
  tokenAmount: 0,
  entryDate: "",
  startDate: "",
  durationMonths: 12,
  status: "Pending Activation",
  remarks: "",
  assignedSales: "",
};

const PlanForm = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const [clientAutoData, setClientAutoData] = useState(null);

  const [showToken, setShowToken] = useState(false);

  const [searchParams] = useSearchParams();
  const clientIdFromURL = searchParams.get("clientId");

  // Load Clients & Users
  useEffect(() => {
    clientApi
      .getClients()
      .then((res) => setClients(res.clients || []))
      .catch(() => toast.error("Unable to load clients"));

    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch(() => toast.error("Unable to load users"));
  }, []);

  // ⭐ Auto-Fill Client Data
  useEffect(() => {
    if (clientIdFromURL) {
      clientApi
        .getClient(clientIdFromURL)
        .then((res) => setClientAutoData(res.client))
        .catch(() => toast.error("Failed to auto-fill client info"));
    }
  }, [clientIdFromURL]);

  // Dropdown Options
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        label: `${c.name} (${c.clientCode || "No Code"})`,
        value: c.id || c._id,
      })),
    [clients]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        label: u.name,
        value: u.id || u._id,
      })),
    [users]
  );

  const statusOptions = PLAN_STATUSES.map((st) => ({ value: st, label: st }));
  const planTypeOptions = PLAN_TYPES.map((t) => ({ value: t, label: t }));

  // ⭐ FIELDS
  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },

    { name: "planName", label: "Plan Name *" },

    {
      name: "planType",
      label: "Plan Type *",
      type: "select",
      options: planTypeOptions,
      onChange: (e) => setShowToken(e.target.value === "DC"),
    },

    { name: "amount", label: "Base Amount *", type: "number", min: 0 },

    { name: "discount", label: "Discount", type: "number", min: 0 },
    { name: "taxPercent", label: "Tax %", type: "number", min: 0 },

    showToken && {
      name: "tokenAmount",
      label: "Token Amount",
      type: "number",
      min: 0,
    },

    { name: "startDate", label: "Start Date *", type: "date" },

    { name: "durationMonths", label: "Duration Months", type: "number", min: 0 },

    { name: "status", label: "Plan Status *", type: "select", options: statusOptions },

    {
      name: "assignedSales",
      label: "Sales Owner *",
      type: "select",
      options: userOptions,
    },

    { name: "remarks", label: "Remarks", isTextArea: true, col: "col-12" },
  ].filter(Boolean);

  // ⭐ MAIN AUTO-FILL INITIAL VALUES
  const autoFillValues = clientAutoData
    ? {
        clientId: clientIdFromURL,
        planName: `${clientAutoData.name} Plan`,
        assignedSales:
          clientAutoData.assignedSales?._id ||
          clientAutoData.assignedSales?.id ||
          "",
      }
    : {};

  // CREATE
  const createFn = async (payload) => {
    try {
      const res = await planApi.createPlan(payload);
      toast.success("Plan created successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create plan");
      throw err;
    }
  };

  // UPDATE
  const updateFn = async (id, payload) => {
    try {
      const res = await planApi.updatePlan(id, payload);
      toast.success("Plan updated successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update plan");
      throw err;
    }
  };

  // EDIT MODE
  const fetcher = async (id) => {
    const { plan } = await planApi.getPlan(id);

    setShowToken(plan.planType === "DC");

    return {
      ...defaultValues,
      ...plan,
      clientId: plan.client?._id || plan.client?.id || plan.client,
      assignedSales:
        plan.assignedSales?._id ||
        plan.assignedSales?.id ||
        plan.assignedSales ||
        "",
      startDate: plan.startDate?.substring(0, 10) || "",
    };
  };

  return (
    <CrudFormPage
      key={clientAutoData ? "loaded" : "loading"} // ⭐ FORCE RERENDER FIX
      title="Plan"
      schema={schema}
      defaultValues={{ ...defaultValues, ...autoFillValues }}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/plans"
      enableReinitialize={true} // ⭐ IMPORTANT FIX
    />
  );
};

export default PlanForm;
