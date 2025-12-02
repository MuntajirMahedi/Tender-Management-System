// src/pages/activation/ActivationForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useParams } from "react-router-dom";
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

  const { can } = usePermission();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");
  const canSubmit = isEditing ? canUpdate : canCreate;

  // Load clients, plans, users
  useEffect(() => {
    clientApi.getClients().then((r) => setClients(r.clients || []));
    planApi.getPlans().then((r) => setPlans(r.plans || []));
    userApi.getUsers().then((r) => setUsers(r.users || []));
  }, []);

  // Client dropdown
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: c.id || c._id,
        label: `${c.name} (${c.clientCode || "No Code"})`,
      })),
    [clients]
  );

  // Filter plans based on client selection
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => p.client?._id === selectedClientId)
      .map((p) => ({
        value: p.id || p._id,
        label: `${p.planName} – ${p.client?.name}`,
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

  // ⭐ FIXED — Convert status string list to object list
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
      options: activationStatusOptions, // ⭐ FIXED
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

    const cid = task.client?._id;

    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...task,
      clientId: cid,
      planId: task.plan?._id,
      assignedTo: task.assignedTo?._id,
      startDate: task.startDate?.substring(0, 10) || "",
      dueDate: task.dueDate?.substring(0, 10) || "",
    };
  };

  const handleFieldChange = (name, value) => {
    if (name === "clientId") setSelectedClientId(value);
  };

  return (
    <RequirePermission permission="activation:view">
      <CrudFormPage
        title="Activation Task"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        createFn={createFn}
        updateFn={updateFn}
        fetcher={isEditing ? fetcher : undefined}
        redirectPath="/activation"
        onFieldChange={handleFieldChange}
        disabled={!canSubmit}
        hideSubmit={!canSubmit}
      />
    </RequirePermission>
  );
};

export default ActivationForm;
