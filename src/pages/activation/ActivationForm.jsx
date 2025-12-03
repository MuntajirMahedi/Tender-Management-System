// src/pages/activation/ActivationForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import CrudFormPage from "../common/CrudFormPage";
import { activationApi, clientApi, planApi, userApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  taskName: yup.string().required("Task name is required"),
  assignedTo: yup.string().required("Assigned user is required"),
  startDate: yup.string().required("Start date is required"),
  dueDate: yup.string().required("Due date is required"),
});

const defaultValues = {
  clientId: "",
  planId: "",
  taskName: "",
  taskType: "",
  status: "Pending",
  assignedTo: "",
  startDate: "",
  dueDate: "",
  notes: "",
};

const ActivationForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientAutoData, setClientAutoData] = useState(null);

  const { can } = usePermission();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");
  const canSubmit = isEditing ? canUpdate : canCreate;

  // Read URL params for auto-fill
  const [searchParams] = useSearchParams();
  const clientIdFromURL = searchParams.get("clientId");
  const planIdFromURL = searchParams.get("planId");

  // Load clients, plans, users
  useEffect(() => {
    clientApi
      .getClients()
      .then((r) => setClients(r.clients || []))
      .catch(() => toast.error("Unable to load clients"));

    planApi
      .getPlans()
      .then((r) => setPlans(r.plans || []))
      .catch(() => toast.error("Unable to load plans"));

    userApi
      .getUsers()
      .then((r) => setUsers(r.users || []))
      .catch(() => toast.error("Unable to load users"));
  }, []);

  // If URL provides clientId, fetch that client's details for better auto-fill
  useEffect(() => {
    if (!clientIdFromURL) return;

    clientApi
      .getClient(clientIdFromURL)
      .then((res) => {
        const c = res.client;
        setClientAutoData(c || null);
        setSelectedClientId(clientIdFromURL);
      })
      .catch(() => {
        setClientAutoData(null);
        toast.error("Failed to load client for auto-fill");
      });
  }, [clientIdFromURL]);

  // Client dropdown
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: c.id || c._id,
        label: `${c.name} (${c.clientCode || "No Code"})`,
      })),
    [clients]
  );

  // Filter plans based on client selection (use string compare to be safe)
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => String(p.client?._id || p.client) === String(selectedClientId))
      .map((p) => ({
        value: p.id || p._id,
        label: `${p.planName} – ${p.planType}`,
      }));
  }, [plans, selectedClientId]);

  // Users dropdown
  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id || u._id,
        label: u.name,
      })),
    [users]
  );

  // Convert status string list to object list
  const activationStatusOptions = useMemo(
    () =>
      ACTIVATION_STATUSES.map((st) => ({
        value: st,
        label: st,
      })),
    []
  );

  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan *", type: "select", options: planOptions },
    { name: "taskName", label: "Task Name *" },
    { name: "taskType", label: "Task Type (Optional)" },
    {
      name: "status",
      label: "Status *",
      type: "select",
      options: activationStatusOptions,
    },
    { name: "assignedTo", label: "Assigned To *", type: "select", options: userOptions },
    { name: "startDate", label: "Start Date *", type: "date" },
    { name: "dueDate", label: "Due Date *", type: "date" },
    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" },
  ];

  // Create
  const createFn =
    canCreate &&
    (async (payload) => {
      try {
        const res = await activationApi.createTask(payload);
        toast.success("Activation task created successfully");
        return res;
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to create task");
        throw err;
      }
    });

  // Update
  const updateFn =
    canUpdate &&
    (async (taskId, payload) => {
      try {
        const res = await activationApi.updateTask(taskId, payload);
        toast.success("Activation task updated successfully");
        return res;
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update task");
        throw err;
      }
    });

  // Fetch edit data
  const fetcher = async (taskId) => {
    const { task } = await activationApi.getTask(taskId);

    const cid = task.client?._id || task.client?.id || task.client;
    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...task,
      clientId: cid,
      planId: task.plan?._id || task.plan?.id || task.plan,
      assignedTo: task.assignedTo?._id || task.assignedTo?.id || task.assignedTo || "",
      startDate: task.startDate?.substring(0, 10) || "",
      dueDate: task.dueDate?.substring(0, 10) || "",
    };
  };

  const handleFieldChange = (name, value) => {
    if (name === "clientId") {
      setSelectedClientId(value);
    }
  };

  // Build auto-fill default values when not editing and URL provides client/plan
  const autoFillValues = (() => {
    if (!clientIdFromURL && !planIdFromURL) return {};

    const v = {
      clientId: clientIdFromURL || "",
      planId: planIdFromURL || "",
    };

    if (clientAutoData) {
      // Prefer assignedCare for activation; fallback to assignedSales
      const assignedToId =
        clientAutoData.assignedCare?._id ||
        clientAutoData.assignedCare?.id ||
        clientAutoData.assignedSales?._id ||
        clientAutoData.assignedSales?.id ||
        "";

      v.assignedTo = assignedToId;
      v.taskName = clientAutoData.name ? `${clientAutoData.name} Activation` : v.taskName;
    }

    return v;
  })();

  return (
    <RequirePermission permission="activation:view">
      <CrudFormPage
        key={clientAutoData ? `autofill-${clientAutoData._id || clientAutoData.id}` : clientIdFromURL || "activation-form"}
        title="Activation Task"
        schema={schema}
        defaultValues={{ ...defaultValues, ...autoFillValues }}
        fields={fields}
        createFn={createFn}
        updateFn={updateFn}
        fetcher={isEditing ? fetcher : undefined}
        redirectPath="/activation"
        onFieldChange={handleFieldChange}
        disabled={!canSubmit}
        hideSubmit={!canSubmit}
        enableReinitialize={true}
      />
    </RequirePermission>
  );
};

export default ActivationForm;
