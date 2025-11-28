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

// ✅ Validation – includes status + assignedTo
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  ticketType: yup.string().required("Type is required"),
  subject: yup.string().required("Subject is required"),
  priority: yup.string().required("Priority is required"),
  status: yup.string().required("Status is required"),
  assignedTo: yup.string().required("Assigned user is required")
});

// Default form values
const defaultValues = {
  clientId: "",
  planId: "",
  ticketType: "Complaint",
  subject: "",
  description: "",
  priority: "Medium",
  status: "Open",
  assignedTo: ""
};

const TicketForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);

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

  // Fields with proper Required (*) + Optional labels
  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions
    },
    {
      name: "planId",
      label: "Plan (Optional)",
      type: "select",
      options: planOptions
    },

    {
      name: "ticketType",
      label: "Type *",
      type: "select",
      options: TICKET_TYPES
    },
    { name: "subject", label: "Subject *" },

    {
      name: "description",
      label: "Description (Optional)",
      isTextArea: true,
      col: "col-12"
    },

    {
      name: "priority",
      label: "Priority *",
      type: "select",
      options: TICKET_PRIORITIES
    },

    {
      name: "status",
      label: "Status *",
      type: "select",
      options: TICKET_STATUSES
    },

    {
      name: "assignedTo",
      label: "Assigned To *",
      type: "select",
      options: userOptions
    }
  ];

  // ✅ Create with toast
  const createFn = async (payload) => {
    try {
      const res = await ticketApi.createTicket(payload);
      toast.success("Ticket created successfully");
      return res;
    } catch (err) {
      console.error("Failed to create ticket", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create ticket";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Update with toast + correct status API
  const updateFn = async (id, payload) => {
    try {
      const { status, ...rest } = payload;

      // 1️⃣ Update main ticket fields
      const res = await ticketApi.updateTicket(id, rest);

      // 2️⃣ Update status via dedicated endpoint
      if (status) {
        await ticketApi.updateTicketStatus(id, { status });
      }

      toast.success("Ticket updated successfully");
      return res;
    } catch (err) {
      console.error("Failed to update ticket", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update ticket";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Prefill edit form with all details
  const fetcher = async (id) => {
    const { ticket } = await ticketApi.getTicket(id);
    return {
      ...defaultValues,
      ...ticket,
      clientId: ticket.client?._id || ticket.client,
      planId: ticket.plan?._id || ticket.plan,
      assignedTo: ticket.assignedTo?._id || ticket.assignedTo
    };
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
    />
  );
};

export default TicketForm;
