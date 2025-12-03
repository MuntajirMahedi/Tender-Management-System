// src/pages/invoices/InvoiceForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
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
  const [clientAutoData, setClientAutoData] = useState(null);

  // Read URL params for auto-fill
  const [searchParams] = useSearchParams();
  const clientIdFromURL = searchParams.get("clientId");
  const planIdFromURL = searchParams.get("planId");

  // Load dropdown values
  useEffect(() => {
    clientApi
      .getClients()
      .then((res) => setClients(res.clients || []))
      .catch(() => toast.error("Unable to load clients"));

    planApi
      .getPlans()
      .then((res) => setPlans(res.plans || []))
      .catch(() => toast.error("Unable to load plans"));
  }, []);

  // If clientId provided in URL, fetch client details for better auto-fill (optional)
  useEffect(() => {
    if (!clientIdFromURL) return;
    clientApi
      .getClient(clientIdFromURL)
      .then((res) => {
        setClientAutoData(res.client || null);
        setSelectedClientId(clientIdFromURL);
      })
      .catch(() => {
        setClientAutoData(null);
        toast.error("Failed to load client info for auto-fill");
      });
  }, [clientIdFromURL]);

  // Client dropdown options
  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client._id || client.id,
        label: `${client.name} (${client.clientCode || "No Code"})`,
      })),
    [clients]
  );

  // Payment statuses
  const paymentStatusOptions = useMemo(
    () =>
      PAYMENT_STATUSES.map((st) => ({
        value: st,
        label: st,
      })),
    []
  );

  // ALL plans map (lookup) — map both _id and id to plan for safety
  const planLookup = useMemo(() => {
    const map = {};
    plans.forEach((p) => {
      const key1 = p._id || p.id;
      if (key1) map[String(key1)] = p;
      // also try to map client-id keyed entries (not overwriting)
    });
    return map;
  }, [plans]);

  // Filter plans by client (string-safe compare)
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => String(p.client?._id || p.client?.id || p.client) === String(selectedClientId))
      .map((p) => ({
        value: p._id || p.id,
        label: `${p.planName} (${p.planType || ""})`,
      }));
  }, [plans, selectedClientId]);

  // Form fields
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
    { name: "baseAmount", label: "Base Amount *", type: "number", min: 0 },
    { name: "discount", label: "Discount", type: "number", min: 0 },
    { name: "taxPercent", label: "Tax % *", type: "number", min: 0 },
    {
      name: "paymentStatus",
      label: "Payment Status *",
      type: "select",
      options: paymentStatusOptions,
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

  // Load invoice on edit
  const fetcher = async (id) => {
    const { invoice } = await invoiceApi.getInvoice(id);

    const cid = invoice.client?._id || invoice.client?.id || invoice.client;

    // Auto-filter plans
    setSelectedClientId(cid);

    return {
      ...defaultValues,
      ...invoice,
      clientId: cid,
      planId: invoice.plan?._id || invoice.plan?.id || invoice.plan,
      invoiceDate: invoice.invoiceDate?.substring(0, 10) || "",
      dueDate: invoice.dueDate?.substring(0, 10) || "",
      taxPercent: invoice.taxPercent || 18,
    };
  };

  // AUTO-FILL handler: signature may include setValue (CrudFormPage may pass it)
  const handleFieldChange = (name, value, values, setValue) => {
    if (name === "clientId") {
      setSelectedClientId(value);
      return;
    }

    if (name === "planId") {
      // If setValue provided by CrudFormPage, use it to fill dependent fields
      const plan = planLookup[String(value)];
      if (!plan) return;

      // set base values from plan (if setValue available)
      if (typeof setValue === "function") {
        setValue("baseAmount", plan.amount ?? 0);
        setValue("discount", plan.discount ?? 0);
        setValue("taxPercent", plan.taxPercent ?? 18);
        setValue("notes", plan.remarks ?? "");

        // Set invoiceDate to today and dueDate to +7 days if not already set
        const today = new Date();
        const invoiceDateStr = today.toISOString().substring(0, 10);
        setValue("invoiceDate", invoiceDateStr);

        const due = new Date();
        due.setDate(due.getDate() + 7);
        setValue("dueDate", due.toISOString().substring(0, 10));
      } else {
        // If setValue not available, try to mutate values (best-effort)
        try {
          if (values && typeof values === "object") {
            values.baseAmount = plan.amount ?? 0;
            values.discount = plan.discount ?? 0;
            values.taxPercent = plan.taxPercent ?? 18;
            values.notes = plan.remarks ?? "";

            const today = new Date();
            values.invoiceDate = today.toISOString().substring(0, 10);
            const due = new Date();
            due.setDate(due.getDate() + 7);
            values.dueDate = due.toISOString().substring(0, 10);
          }
        } catch (e) {
          // swallow — fine if not possible
        }
      }
    }
  };

  // Build auto-fill default values when opening from client/plan URL
  const autoFillValues = (() => {
    if (!clientIdFromURL && !planIdFromURL) return {};

    const v = {
      clientId: clientIdFromURL || "",
      planId: planIdFromURL || "",
    };

    // If clientAutoData fetched earlier, we could add more defaults (not strictly necessary)
    // Example: set notes or default paymentStatus from client preferences (if any)
    return v;
  })();

  return (
    <CrudFormPage
      key={clientAutoData ? `invoice-autofill-${clientAutoData._id || clientAutoData.id}` : clientIdFromURL || planIdFromURL || "invoice-form"}
      title="Invoice"
      schema={schema}
      defaultValues={{ ...defaultValues, ...autoFillValues }}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/invoices"
      onFieldChange={handleFieldChange}
      enableReinitialize={true}
    />
  );
};

export default InvoiceForm;
