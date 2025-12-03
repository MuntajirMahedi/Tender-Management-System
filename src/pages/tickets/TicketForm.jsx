// src/pages/tickets/TicketForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

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
  const [clientAutoData, setClientAutoData] = useState(null);

  // Read URL params
  const [searchParams] = useSearchParams();
  const clientIdFromURL = searchParams.get("clientId");
  const planIdFromURL = searchParams.get("planId");

  // Load all data
  useEffect(() => {
    clientApi
      .getClients()
      .then((res) => setClients(res.clients || []))
      .catch(() => toast.error("Unable to load clients"));

    planApi
      .getPlans()
      .then((res) => setPlans(res.plans || []))
      .catch(() => toast.error("Unable to load plans"));

    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
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

  // Plan dropdown filtered by client (string-safe compare)
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => String(p.client?._id || p.client) === String(selectedClientId))
      .map((p) => ({
        value: p.id || p._id,
        label: `${p.planName} – ${p.client?.name || ""}`,
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

  // Convert arrays to options
  const ticketTypeOptions = useMemo(
    () => TICKET_TYPES.map((t) => ({ value: t, label: t })),
    []
  );

  const priorityOptions = useMemo(
    () => TICKET_PRIORITIES.map((p) => ({ value: p, label: p })),
    []
  );

  const statusOptions = useMemo(
    () => TICKET_STATUSES.map((s) => ({ value: s, label: s })),
    []
  );

  // Form fields
  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan (Optional)", type: "select", options: planOptions },

    { name: "ticketType", label: "Type *", type: "select", options: ticketTypeOptions },

    { name: "subject", label: "Subject *" },

    { name: "description", label: "Description (Optional)", isTextArea: true, col: "col-12" },

    { name: "priority", label: "Priority *", type: "select", options: priorityOptions },

    { name: "status", label: "Status *", type: "select", options: statusOptions },

    { name: "assignedTo", label: "Assigned To *", type: "select", options: userOptions },
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

    const cid = ticket.client?._id || ticket.client?.id || ticket.client;
    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...ticket,
      clientId: cid,
      planId: ticket.plan?._id || ticket.plan?.id || "",
      assignedTo: ticket.assignedTo?._id || ticket.assignedTo?.id || "",
    };
  };

  // Handle client change
  const handleFieldChange = (name, value) => {
    if (name === "clientId") setSelectedClientId(value);
  };

  // Build auto-fill default values when not editing and URL provides client/plan
  const autoFillValues = (() => {
    if (!clientIdFromURL && !planIdFromURL) return {};

    const v = {
      clientId: clientIdFromURL || "",
      planId: planIdFromURL || "",
    };

    if (clientAutoData) {
      const assignedToId =
        clientAutoData.assignedCare?._id ||
        clientAutoData.assignedCare?.id ||
        clientAutoData.assignedSales?._id ||
        clientAutoData.assignedSales?.id ||
        "";

      v.assignedTo = assignedToId || "";
      v.subject = clientAutoData.name ? `${clientAutoData.name} - Ticket` : v.subject;
    }

    return v;
  })();

  return (
    <CrudFormPage
      key={clientAutoData ? `autofill-${clientAutoData._id || clientAutoData.id}` : clientIdFromURL || "ticket-form"}
      title="Ticket"
      schema={schema}
      defaultValues={{ ...defaultValues, ...autoFillValues }}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/tickets"
      onFieldChange={handleFieldChange}
      enableReinitialize={true}
    />
  );
};

export default TicketForm;
