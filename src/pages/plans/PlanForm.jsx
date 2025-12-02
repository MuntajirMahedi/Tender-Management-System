// src/pages/plans/PlanForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, userApi } from "../../api";
import { PLAN_TYPES, PLAN_STATUSES } from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planType: yup.string().required("Plan type is required"),
  planName: yup.string().required("Plan name is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required"),
  assignedSales: yup.string().required("Sales owner is required"),
  startDate: yup.string().required("Start date is required")
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
  assignedSales: ""
};

const PlanForm = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

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

  // Client dropdown
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        label: `${c.name} (${c.clientCode || "No Code"})`,
        value: c.id || c._id
      })),
    [clients]
  );

  // User dropdown
  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        label: u.name,
        value: u.id || u._id
      })),
    [users]
  );

  // ⭐ FIX STATUS DROPDOWN
  const statusOptions = useMemo(
    () =>
      PLAN_STATUSES.map((st) => ({
        value: st,
        label: st
      })),
    []
  );

  // ⭐ FIX PLAN TYPE DROPDOWN ALSO (PLAN_TYPES bhi string array hota hai)
  const planTypeOptions = useMemo(
    () =>
      PLAN_TYPES.map((type) => ({
        value: type,
        label: type
      })),
    []
  );

  // Form Fields
  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions
    },
    {
      name: "planName",
      label: "Plan Name *"
    },
    {
      name: "planType",
      label: "Plan Type *",
      type: "select",
      options: planTypeOptions // ⭐ FIXED
    },
    {
      name: "amount",
      label: "Base Amount *",
      type: "number"
    },

    { name: "discount", label: "Discount (Optional)", type: "number" },
    { name: "taxPercent", label: "Tax %", type: "number" },
    { name: "tokenAmount", label: "Token Amount (Optional)", type: "number" },

    { name: "startDate", label: "Start Date *", type: "date" },

    {
      name: "durationMonths",
      label: "Duration Months",
      type: "number"
    },

    {
      name: "status",
      label: "Plan Status *",
      type: "select",
      options: statusOptions // ⭐ FIXED
    },

    {
      name: "assignedSales",
      label: "Sales Owner *",
      type: "select",
      options: userOptions
    },

    {
      name: "remarks",
      label: "Remarks (Optional)",
      isTextArea: true,
      col: "col-12"
    }
  ];

  // Create plan
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

  // Update plan
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

  // Prefill on edit
  const fetcher = async (id) => {
    const { plan } = await planApi.getPlan(id);

    return {
      ...defaultValues,
      ...plan,
      clientId: plan.client?._id || plan.client?.id || plan.client,
      assignedSales:
        plan.assignedSales?._id ||
        plan.assignedSales?.id ||
        plan.assignedSales ||
        "",
      startDate: plan.startDate?.substring(0, 10) || ""
    };
  };

  return (
    <CrudFormPage
      title="Plan"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/plans"
    />
  );
};

export default PlanForm;
