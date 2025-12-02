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

// ✅ Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  taskName: yup.string().required("Task name is required"),
  assignedTo: yup.string().required("Assigned user is required"),
  startDate: yup.string().required("Start date is required"),
  dueDate: yup.string().required("Due date is required")
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
  notes: ""
};

const ActivationForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);

  const { can } = usePermission();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");

  // ❗ Can user submit this form?
  const canSubmit = isEditing ? canUpdate : canCreate;

  useEffect(() => {
    clientApi
      .getClients()
      .then((res) => setClients(res.clients || []))
      .catch((err) => {
        console.error("Unable to load clients", err);
        toast.error("Unable to load clients");
      });

    planApi
      .getPlans()
      .then((res) => setPlans(res.plans || []))
      .catch((err) => {
        console.error("Unable to load plans", err);
        toast.error("Unable to load plans");
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
        value: client.id || client._id,
        label: `${client.name} (${client.clientCode || "No Code"})`
      })),
    [clients]
  );

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id || plan._id,
        label: `${plan.planName} – ${plan.client?.name || ""}`
      })),
    [plans]
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id || user._id,
        label: user.name
      })),
    [users]
  );

  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions
    },
    {
      name: "planId",
      label: "Plan *",
      type: "select",
      options: planOptions
    },
    { name: "taskName", label: "Task Name *" },
    { name: "taskType", label: "Task Type (Optional)" },
    {
      name: "status",
      label: "Status *",
      type: "select",
      options: ACTIVATION_STATUSES
    },
    {
      name: "assignedTo",
      label: "Assigned To *",
      type: "select",
      options: userOptions
    },
    { name: "startDate", label: "Start Date *", type: "date" },
    { name: "dueDate", label: "Due Date *", type: "date" },
    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" }
  ];

  // ✅ Create with toast
  const createFn = canCreate
    ? async (payload) => {
        try {
          const res = await activationApi.createTask(payload);
          toast.success("Activation task created successfully");
          return res;
        } catch (err) {
          console.error("Failed to create activation task", err);
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create activation task";
          toast.error(msg);
          throw err;
        }
      }
    : null;

  // ✅ Update with toast
  const updateFn = canUpdate
    ? async (taskId, payload) => {
        try {
          const res = await activationApi.updateTask(taskId, payload);
          toast.success("Activation task updated successfully");
          return res;
        } catch (err) {
          console.error("Failed to update activation task", err);
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update activation task";
          toast.error(msg);
          throw err;
        }
      }
    : null;

  // ✅ Prefill edit form with all details
  const fetcher = async (taskId) => {
    const { task } = await activationApi.getTask(taskId);

    return {
      ...defaultValues,
      ...task,
      clientId: task.client?._id || task.client || "",
      planId: task.plan?._id || task.plan || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      startDate: task.startDate ? task.startDate.substring(0, 10) : "",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ""
    };
  };

  return (
    <RequirePermission permission="activation:view">
      <CrudFormPage
        title="Activation Task"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        disabled={!canSubmit} // read-only if no permission to create/update
        createFn={createFn}
        updateFn={updateFn}
        fetcher={isEditing ? fetcher : undefined}
        redirectPath="/activation"
        hideSubmit={!canSubmit} // hide submit button if cannot submit
      />
    </RequirePermission>
  );
};

export default ActivationForm;
