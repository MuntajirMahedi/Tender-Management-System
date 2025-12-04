import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import CrudFormPage from "../common/CrudFormPage";
import { clientApi, invoiceApi, planApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";

// ⭐ Dynamic Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  invoiceDate: yup.string().required("Invoice date is required"),

  // ⭐ Due Date required only when paymentStatus = Paid
  dueDate: yup.string().when("paymentStatus", {
    is: (val) => val === "Paid",
    then: (s) => s.required("Due Date is required"),
    otherwise: (s) => s.notRequired(),
  }),

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

  // ⭐ Due Date show/hide
  const [showDueDate, setShowDueDate] = useState(true);

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

  // Auto-fill by URL
  useEffect(() => {
    if (!clientIdFromURL) return;

    clientApi
      .getClient(clientIdFromURL)
      .then((res) => {
        setClientAutoData(res.client);
        setSelectedClientId(clientIdFromURL);
      })
      .catch(() => toast.error("Failed to auto-fill client info"));
  }, [clientIdFromURL]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client._id || client.id,
        label: `${client.name} (${client.clientCode || "No Code"})`,
      })),
    [clients]
  );

  const paymentStatusOptions = useMemo(
    () => PAYMENT_STATUSES.map((st) => ({ value: st, label: st })),
    []
  );

  const planLookup = useMemo(() => {
    const map = {};
    plans.forEach((p) => {
      const k = p._id || p.id;
      if (k) map[String(k)] = p;
    });
    return map;
  }, [plans]);

  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter(
        (p) =>
          String(p.client?._id || p.client?.id || p.client) ===
          String(selectedClientId)
      )
      .map((p) => ({
        value: p._id || p.id,
        label: `${p.planName} (${p.planType || ""})`,
      }));
  }, [plans, selectedClientId]);

  // ⭐ FIELDS (Due Date conditional)
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

    showDueDate && {
      name: "dueDate",
      label: "Due Date *",
      type: "date",
    },

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
  ].filter(Boolean); // ⭐ remove false entries

  // Create
  const createFn = async (payload) => {
    try {
      const res = await invoiceApi.createInvoice(payload);
      toast.success("Invoice created successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
      throw err;
    }
  };

  // Update
  const updateFn = async (id, payload) => {
    try {
      const res = await invoiceApi.updateInvoice(id, payload);
      toast.success("Invoice updated successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update invoice");
      throw err;
    }
  };

  // Edit loader
  const fetcher = async (id) => {
    const { invoice } = await invoiceApi.getInvoice(id);

    const cid =
      invoice.client?._id || invoice.client?.id || invoice.client;

    setSelectedClientId(cid);

    // ⭐ Show/hide due date based on loaded invoice
    setShowDueDate(invoice.paymentStatus === "Paid");

    return {
      ...defaultValues,
      ...invoice,
      clientId: cid,
      planId: invoice.plan?._id || invoice.plan?.id || invoice.plan,
      invoiceDate: invoice.invoiceDate?.substring(0, 10) || "",
      dueDate: invoice.dueDate?.substring(0, 10) || "",
    };
  };

  // ⭐ Field Change Logic
  const handleFieldChange = (name, value, values, setValue) => {
    if (name === "clientId") {
      setSelectedClientId(value);
      return;
    }

    if (name === "paymentStatus") {
      if (value === "Paid") {
        setShowDueDate(true);
      } else {
        setShowDueDate(false);
        setValue("dueDate", "");
      }
    }

    if (name === "planId") {
      const plan = planLookup[String(value)];
      if (!plan) return;

      setValue("baseAmount", plan.amount ?? 0);
      setValue("discount", plan.discount ?? 0);
      setValue("taxPercent", plan.taxPercent ?? 18);
      setValue("notes", plan.remarks ?? "");

      const today = new Date();
      const invoiceDateStr = today.toISOString().substring(0, 10);
      setValue("invoiceDate", invoiceDateStr);

      const due = new Date();
      due.setDate(due.getDate() + 7);
      setValue("dueDate", due.toISOString().substring(0, 10));
    }
  };

  const autoFillValues = {
    clientId: clientIdFromURL || "",
    planId: planIdFromURL || "",
  };

  return (
    <CrudFormPage
      key={
        clientAutoData
          ? `invoice-autofill-${clientAutoData._id || clientAutoData.id}`
          : clientIdFromURL || planIdFromURL || "invoice-form"
      }
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
