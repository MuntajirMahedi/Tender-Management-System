// src/pages/invoices/InvoiceForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, invoiceApi, planApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  invoiceDate: yup.string().required("Invoice date is required"),
  dueDate: yup.string().required("Due date is required"),
  baseAmount: yup
    .number()
    .typeError("Base amount must be a number")
    .required("Base amount is required"),
  taxPercent: yup
    .number()
    .typeError("Tax must be a number")
    .required("Tax % is required"),
});

// Defaults
const defaultValues = {
  clientId: "",
  planId: "",
  invoiceDate: "",
  dueDate: "",
  baseAmount: "",
  discount: 0,
  taxPercent: 18,
  paymentStatus: "Pending",
  notes: "",
};

const InvoiceForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedClientId, setSelectedClientId] = useState("");

  // Load dropdown data
  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    planApi.getPlans().then((res) => setPlans(res.plans || []));
  }, []);

  // Client dropdown options
  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client._id || client.id,
        label: `${client.name} (${client.clientCode || "No Code"})`,
      })),
    [clients]
  );

  // ⭐ Payment Status dropdown FIX
  const paymentStatusOptions = useMemo(
    () =>
      PAYMENT_STATUSES.map((st) => ({
        value: st,
        label: st,
      })),
    []
  );

  // ⭐ Filter plans by selected client
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => p.client?._id === selectedClientId)
      .map((p) => ({
        value: p._id || p.id,
        label: `${p.planName} (${p.client?.name})`,
      }));
  }, [plans, selectedClientId]);

  // Form Fields
  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions,
    },
    {
      name: "planId",
      label: "Plan *",
      type: "select",
      options: planOptions,
    },

    { name: "invoiceDate", label: "Invoice Date *", type: "date" },
    { name: "dueDate", label: "Due Date *", type: "date" },

    { name: "baseAmount", label: "Base Amount *", type: "number" },
    { name: "discount", label: "Discount", type: "number" },

    { name: "taxPercent", label: "Tax % *", type: "number" },

    {
      name: "paymentStatus",
      label: "Payment Status *",
      type: "select",
      options: paymentStatusOptions, // ← FIXED
    },

    { name: "notes", label: "Notes", isTextArea: true, col: "col-12" },
  ];

  // Create invoice
  const createFn = async (payload) => {
    try {
      const res = await invoiceApi.createInvoice({
        ...payload,
        taxPercent: payload.taxPercent || 18,
      });
      toast.success("Invoice created successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
      throw err;
    }
  };

  // Update invoice
  const updateFn = async (id, payload) => {
    try {
      const res = await invoiceApi.updateInvoice(id, {
        ...payload,
        taxPercent: payload.taxPercent || 18,
      });
      toast.success("Invoice updated successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update invoice");
      throw err;
    }
  };

  // Fetch invoice on edit
  const fetcher = async (id) => {
    const { invoice } = await invoiceApi.getInvoice(id);

    const cid = invoice.client?._id;

    // Auto-update plans dropdown
    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...invoice,
      clientId: cid,
      planId: invoice.plan?._id,
      invoiceDate: invoice.invoiceDate?.substring(0, 10) || "",
      dueDate: invoice.dueDate?.substring(0, 10) || "",
      taxPercent: invoice.taxPercent || 18,
    };
  };

  // Handle client change → update plans
  const handleFieldChange = (name, value) => {
    if (name === "clientId") {
      setSelectedClientId(value);
    }
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
      onFieldChange={handleFieldChange}
    />
  );
};

export default InvoiceForm;
