// src/pages/invoices/InvoiceForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, invoiceApi, planApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";

// ✅ Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  invoiceDate: yup
    .string()
    .required("Invoice date is required"),
  dueDate: yup
    .string()
    .required("Due date is required"),
  baseAmount: yup
    .number()
    .typeError("Base amount must be a number")
    .required("Base amount is required"),
  taxPercent: yup
    .number()
    .typeError("Tax must be a number")
    .required("Tax % is required")
});

// Default Values
const defaultValues = {
  clientId: "",
  planId: "",
  invoiceDate: "",
  dueDate: "",
  baseAmount: "",
  discount: 0,
  taxPercent: 18, // ✅ default 18
  paymentStatus: "Pending",
  notes: ""
};

const InvoiceForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);

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

  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan *", type: "select", options: planOptions },

    // ✅ Now required in UI
    { name: "invoiceDate", label: "Invoice Date *", type: "date" },
    { name: "dueDate", label: "Due Date *", type: "date" },

    { name: "baseAmount", label: "Base Amount *", type: "number" },
    { name: "discount", label: "Discount (Optional)", type: "number" },

    // ✅ Tax required, default 18
    { name: "taxPercent", label: "Tax % *", type: "number" },

    {
      name: "paymentStatus",
      label: "Payment Status *",
      type: "select",
      options: PAYMENT_STATUSES
    },

    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" }
  ];

  // ✅ Create with toast
  const createFn = async (payload) => {
    try {
      const res = await invoiceApi.createInvoice({
        ...payload,
        taxPercent: payload.taxPercent || 18
      });
      toast.success("Invoice created successfully");
      return res;
    } catch (err) {
      console.error("Failed to create invoice", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create invoice";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Update with toast
  const updateFn = async (id, payload) => {
    try {
      const res = await invoiceApi.updateInvoice(id, {
        ...payload,
        taxPercent: payload.taxPercent || 18
      });
      toast.success("Invoice updated successfully");
      return res;
    } catch (err) {
      console.error("Failed to update invoice", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update invoice";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Prefill data on edit (with proper date formatting)
  const fetcher = async (id) => {
    const { invoice } = await invoiceApi.getInvoice(id);

    return {
      ...defaultValues,
      ...invoice,
      clientId: invoice.client?._id || invoice.client || "",
      planId: invoice.plan?._id || invoice.plan || "",
      invoiceDate: invoice.invoiceDate
        ? invoice.invoiceDate.substring(0, 10)
        : "",
      dueDate: invoice.dueDate ? invoice.dueDate.substring(0, 10) : "",
      taxPercent:
        typeof invoice.taxPercent === "number" && !Number.isNaN(invoice.taxPercent)
          ? invoice.taxPercent
          : 18
    };
  };

  return (
    <CrudFormPage
      title="Invoice"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/invoices"
    />
  );
};

export default InvoiceForm;
