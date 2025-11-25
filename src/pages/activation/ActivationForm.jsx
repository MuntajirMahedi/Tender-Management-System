import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { activationApi, clientApi, planApi, userApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";

// Only backend-required fields
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  taskName: yup.string().required("Task name is required")
});

// Default values
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

  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    planApi.getPlans().then((res) => setPlans(res.plans || []));
    userApi.getUsers().then((res) => setUsers(res.users || []));
  }, []);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id || client._id,
        label: `${client.name} (${client.clientCode})`
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

  // Form fields with required/optional labels
  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan *", type: "select", options: planOptions },

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
      label: "Assigned To (Optional)",
      type: "select",
      options: userOptions
    },

    { name: "startDate", label: "Start Date (Optional)", type: "date" },
    { name: "dueDate", label: "Due Date (Optional)", type: "date" },

    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" }
  ];

  return (
    <CrudFormPage
      title="Activation Task"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={activationApi.createTask}
      updateFn={(id, payload) => activationApi.updateTask(id, payload)}
      fetcher={async (id) => {
        const { task } = await activationApi.getTask(id);

        return {
          ...task,
          clientId: task.client?._id || task.client,
          planId: task.plan?._id || task.plan,
          assignedTo: task.assignedTo?._id || task.assignedTo
        };
      }}
      redirectPath="/activation"
    />
  );
};

export default ActivationForm;
