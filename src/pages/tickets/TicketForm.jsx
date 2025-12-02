// src/pages/tickets/TicketForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, ticketApi, userApi } from "../../api";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES
} from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  ticketType: yup.string().required("Type is required"),
  subject: yup.string().required("Subject is required"),
  priority: yup.string().required("Priority is required"),
  status: yup.string().required("Status is required"),
  assignedTo: yup.string().required("Assigned user is required"),
});

// Default values
const defaultValues = {
  clientId: "",
  planId: "",
  ticketType: "Complaint",
  subject: "",
  description: "",
  priority: "Medium",
  status: "Open",
  assignedTo: "",
};

const TicketForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedClientId, setSelectedClientId] = useState("");

  // Load all data
  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    planApi.getPlans().then((res) => setPlans(res.plans || []));
    userApi.getUsers().then((res) => setUsers(res.users || []));
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

  // Plan dropdown filtered by client
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => p.client?._id === selectedClientId)
      .map((p) => ({
        value: p.id || p._id,
        label: `${p.planName} – ${p.client?.name}`,
      }));
  }, [plans, selectedClientId]);

  // User dropdown
  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id || u._id,
        label: u.name,
      })),
    [users]
  );

  // ⭐ FIXED — Convert string arrays → dropdown object arrays
  const ticketTypeOptions = useMemo(
    () =>
      TICKET_TYPES.map((t) => ({
        value: t,
        label: t,
      })),
    []
  );

  const priorityOptions = useMemo(
    () =>
      TICKET_PRIORITIES.map((p) => ({
        value: p,
        label: p,
      })),
    []
  );

  const statusOptions = useMemo(
    () =>
      TICKET_STATUSES.map((s) => ({
        value: s,
        label: s,
      })),
    []
  );

  // Form fields
  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan (Optional)", type: "select", options: planOptions },

    {
      name: "ticketType",
      label: "Type *",
      type: "select",
      options: ticketTypeOptions, // FIXED
    },

    { name: "subject", label: "Subject *" },

    { name: "description", label: "Description (Optional)", isTextArea: true, col: "col-12" },

    {
      name: "priority",
      label: "Priority *",
      type: "select",
      options: priorityOptions, // FIXED
    },

    {
      name: "status",
      label: "Status *",
      type: "select",
      options: statusOptions, // FIXED
    },

    {
      name: "assignedTo",
      label: "Assigned To *",
      type: "select",
      options: userOptions,
    },
  ];

  // CREATE
  const createFn = async (payload) => {
    try {
      const res = await ticketApi.createTicket(payload);
      toast.success("Ticket created successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create ticket");
      throw err;
    }
  };

  // UPDATE
  const updateFn = async (id, payload) => {
    try {
      const { status, ...rest } = payload;

      const res = await ticketApi.updateTicket(id, rest);

      if (status) {
        await ticketApi.updateTicketStatus(id, { status });
      }

      toast.success("Ticket updated successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update ticket");
      throw err;
    }
  };

  // Prefill data on edit
  const fetcher = async (id) => {
    const { ticket } = await ticketApi.getTicket(id);

    const cid = ticket.client?._id;

    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...ticket,
      clientId: cid,
      planId: ticket.plan?._id || "",
      assignedTo: ticket.assignedTo?._id || "",
    };
  };

  // Handle client change
  const handleFieldChange = (name, value) => {
    if (name === "clientId") setSelectedClientId(value);
  };

  return (
    <CrudFormPage
      title="Ticket"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/tickets"
      onFieldChange={handleFieldChange}
    />
  );
};

export default TicketForm;
