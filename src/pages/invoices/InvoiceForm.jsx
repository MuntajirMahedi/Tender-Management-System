import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, invoiceApi, planApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";

// Validation (only backend-required)
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  baseAmount: yup
    .number()
    .typeError("Base amount must be a number")
    .required("Base amount is required")
});

// Default Values
const defaultValues = {
  clientId: "",
  planId: "",
  invoiceDate: "",
  dueDate: "",
  baseAmount: "",
  discount: 0,
  taxPercent: 18,
  paymentStatus: "Pending",
  notes: ""
};

const InvoiceForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    planApi.getPlans().then((res) => setPlans(res.plans || []));
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

  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan *", type: "select", options: planOptions },

    { name: "invoiceDate", label: "Invoice Date (Optional)", type: "date" },
    { name: "dueDate", label: "Due Date (Optional)", type: "date" },

    { name: "baseAmount", label: "Base Amount *", type: "number" },
    { name: "discount", label: "Discount (Optional)", type: "number" },
    { name: "taxPercent", label: "Tax % (Optional)", type: "number" },

    {
      name: "paymentStatus",
      label: "Payment Status *",
      type: "select",
      options: PAYMENT_STATUSES
    },

    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" }
  ];

  return (
    <CrudFormPage
      title="Invoice"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={invoiceApi.createInvoice}
      updateFn={(id, payload) => invoiceApi.updateInvoice(id, payload)}
      fetcher={async (id) => {
        const { invoice } = await invoiceApi.getInvoice(id);

        return {
          ...invoice,
          clientId: invoice.client?._id || invoice.client,
          planId: invoice.plan?._id || invoice.plan
        };
      }}
      redirectPath="/invoices"
    />
  );
};

export default InvoiceForm;
