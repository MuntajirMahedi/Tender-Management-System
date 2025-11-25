import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, ticketApi, userApi } from "../../api";
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES } from "../../utils/constants";

// Backend-required validation only
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  ticketType: yup.string().required("Type is required"),
  subject: yup.string().required("Subject is required"),
  priority: yup.string().required("Priority is required")
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

  // Fields with proper Required (*) + Optional labels
  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan (Optional)", type: "select", options: planOptions },

    { name: "ticketType", label: "Type *", type: "select", options: TICKET_TYPES },
    { name: "subject", label: "Subject *" },

    {
      name: "description",
      label: "Description (Optional)",
      isTextArea: true,
      col: "col-12"
    },

    { name: "priority", label: "Priority *", type: "select", options: TICKET_PRIORITIES },

    { name: "status", label: "Status (Optional)", type: "select", options: TICKET_STATUSES },

    { name: "assignedTo", label: "Assigned To (Optional)", type: "select", options: userOptions }
  ];

  return (
    <CrudFormPage
      title="Ticket"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={ticketApi.createTicket}
      updateFn={(id, payload) => ticketApi.updateTicket(id, payload)}
      fetcher={async (id) => {
        const { ticket } = await ticketApi.getTicket(id);
        return {
          ...ticket,
          clientId: ticket.client?._id || ticket.client,
          planId: ticket.plan?._id || ticket.plan,
          assignedTo: ticket.assignedTo?._id || ticket.assignedTo
        };
      }}
      redirectPath="/tickets"
    />
  );
};

export default TicketForm;
