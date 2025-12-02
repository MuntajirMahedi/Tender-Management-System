// src/pages/payments/PaymentForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, paymentApi, planApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  amount: yup.number().required("Amount is required"),
  paymentMode: yup.string().required("Payment mode is required"),
  paymentDate: yup.string().required("Payment date is required"),
});

// Defaults
const defaultValues = {
  clientId: "",
  planId: "",
  amount: "",
  paymentDate: "",
  paymentMode: "",
  bankName: "",
  transactionId: "",
  remarks: "",
};

const PaymentForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    planApi.getPlans().then((res) => setPlans(res.plans || []));
  }, []);

  // Client dropdown
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: c._id || c.id,
        label: `${c.name} (${c.clientCode})`,
      })),
    [clients]
  );

  // Plans filtered by client
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];
    return plans
      .filter((p) => String(p.client?._id) === String(selectedClientId))
      .map((p) => ({
        value: p._id || p.id,
        label: `${p.planName} (${p.planType})`,
      }));
  }, [plans, selectedClientId]);

  // ⭐ FIXED Payment Mode dropdown
  const paymentModeOptions = useMemo(
    () =>
      PAYMENT_MODES.map((m) => ({
        value: m,
        label: m,
      })),
    []
  );

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
    { name: "amount", label: "Amount *", type: "number" },

    { name: "paymentDate", label: "Payment Date *", type: "date" },

    {
      name: "paymentMode",
      label: "Payment Mode *",
      type: "select",
      options: paymentModeOptions, // ⭐ FIXED HERE
    },

    { name: "bankName", label: "Bank Name" },
    { name: "transactionId", label: "Transaction ID" },
    { name: "remarks", label: "Remarks", isTextArea: true, col: "col-12" },
  ];

  // Prefill for edit
  const fetcher = async (id) => {
    const { payment } = await paymentApi.getPayment(id);

    const clientId = payment.client?._id || payment.client?.id;
    const planId = payment.plan?._id || payment.plan?.id;

    setSelectedClientId(clientId);

    return {
      ...defaultValues,
      ...payment,
      clientId,
      planId,
      paymentDate: payment.paymentDate?.substring(0, 10),
    };
  };

  const handleFieldChange = (name, value) => {
    if (name === "clientId") {
      setSelectedClientId(value);
    }
  };

  // Create
  const createFn = async (data) => {
    await paymentApi.createPayment(data);
    toast.success("Payment added");
  };

  // Update
  const updateFn = async (id, data) => {
    await paymentApi.updatePayment(id, data);
    toast.success("Payment updated");
  };

  return (
    <CrudFormPage
      title="Payment"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/payments"
      onFieldChange={handleFieldChange}
    />
  );
};

export default PaymentForm;
