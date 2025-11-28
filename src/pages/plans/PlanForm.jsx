// src/pages/plans/PlanForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, userApi } from "../../api";
import { PLAN_TYPES, PLAN_STATUSES } from "../../utils/constants";

// ✅ Validation — backend required + Sales Owner required
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planType: yup.string().required("Plan type is required"),
  planName: yup.string().required("Plan name is required"),
  amount: yup
    .number()
    .typeError("Amount must be a valid number")
    .required("Amount is required"),
  assignedSales: yup.string().required("Sales owner is required"),
  startDate : yup.string().required("date is required")
});

// Default values
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

  // Load clients + users
  useEffect(() => {
    clientApi
      .getClients()
      .then((res) => setClients(res.clients || []))
      .catch((err) => {
        console.error("Unable to load clients", err);
        toast.error("Unable to load clients");
      });

    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch((err) => {
        console.error("Unable to load users", err);
        toast.error("Unable to load users");
      });
  }, []);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} (${client.clientCode || "No Code"})`,
        value: client.id || client._id
      })),
    [clients]
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.id || user._id
      })),
    [users]
  );

  // Form field definitions
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
      options: PLAN_TYPES
    },
    {
      name: "amount",
      label: "Base Amount *",
      type: "number"
    },

    // Optional Fields
    {
      name: "discount",
      label: "Discount (Optional)",
      type: "number"
    },
    {
      name: "taxPercent",
      label: "Tax % (Default: 18%)",
      type: "number"
    },
    {
      name: "tokenAmount",
      label: "Token Amount (Optional)",
      type: "number"
    },
    {
      name: "startDate",
      label: "Start Date *",
      type: "date"
    },
    {
      name: "durationMonths",
      label: "Duration Months (Default: 12)",
      type: "number"
    },
    {
      name: "status",
      label: "Plan Status (Optional)",
      type: "select",
      options: PLAN_STATUSES
    },
    {
      name: "assignedSales",
      // 🔁 just changed label text – this is what user sees
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

  // ✅ Wrap create with toast
  const createFn = async (payload) => {
    try {
      const res = await planApi.createPlan(payload);
      toast.success("Plan created successfully");
      return res;
    } catch (error) {
      console.error("Failed to create plan", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create plan";
      toast.error(msg);
      throw error;
    }
  };

  // ✅ Wrap update with toast
  const updateFn = async (id, payload) => {
    try {
      const res = await planApi.updatePlan(id, payload);
      toast.success("Plan updated successfully");
      return res;
    } catch (error) {
      console.error("Failed to update plan", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update plan";
      toast.error(msg);
      throw error;
    }
  };

  // ✅ Prefill all details on edit
  const fetcher = async (id) => {
    const { plan } = await planApi.getPlan(id);

    const clientId = plan.client?._id || plan.client?.id || plan.client || "";

    const assignedSales =
      plan.assignedSales?._id ||
      plan.assignedSales?.id ||
      plan.assignedSales ||
      "";

    const startDate = plan.startDate
      ? plan.startDate.substring(0, 10)
      : "";

    return {
      ...defaultValues,
      ...plan,
      clientId,
      assignedSales,
      startDate
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
