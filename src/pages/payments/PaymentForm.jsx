// src/pages/payments/PaymentForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, paymentApi, planApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";

// Updated Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  amount: yup
    .number()
    .typeError("Amount must be a valid number")
    .required("Amount is required"),
  paymentMode: yup.string().required("Payment mode is required"),

  // ⛔ Now required
  paymentDate: yup.string().required("Payment date is required")
});

const defaultValues = {
  clientId: "",
  planId: "",
  amount: "",
  paymentDate: "", // required now
  paymentMode: "",
  bankName: "",
  transactionId: "",
  remarks: ""
};

const PaymentForm = () => {
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
        label: `${client.name} (${client.clientCode || "No Code"})`
      })),
    [clients]
  );

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id || plan._id,
        label: `${plan.planName} — ${plan.client?.name || "No Client"}`
      })),
    [plans]
  );

  const fields = [
    { name: "clientId", label: "Client *", type: "select", options: clientOptions },
    { name: "planId", label: "Plan *", type: "select", options: planOptions },
    { name: "amount", label: "Amount *", type: "number" },

    // ⛔ Now required
    { name: "paymentDate", label: "Payment Date *", type: "date" },

    {
      name: "paymentMode",
      label: "Payment Mode *",
      type: "select",
      options: PAYMENT_MODES
    },
    { name: "bankName", label: "Bank Name (Optional)" },
    { name: "transactionId", label: "Transaction ID (Optional)" },

    { name: "remarks", label: "Remarks (Optional)", isTextArea: true, col: "col-12" }
  ];

  // 🚀 Create with toast feedback
  const createFn = async (payload) => {
    try {
      const res = await paymentApi.createPayment(payload);
      toast.success("Payment recorded successfully");
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to record payment";
      toast.error(msg);
      throw err;
    }
  };

  // ✏ Update with toast feedback
  const updateFn = async (id, payload) => {
    try {
      const res = await paymentApi.updatePayment(id, payload);
      toast.success("Payment updated successfully");
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update payment";
      toast.error(msg);
      throw err;
    }
  };

  // Prefill values for edit
  const fetcher = async (id) => {
    const { payment } = await paymentApi.getPayment(id);

    return {
      ...defaultValues,
      ...payment,
      clientId: payment.client?._id || payment.client || "",
      planId: payment.plan?._id || payment.plan || "",
      paymentDate: payment.paymentDate
        ? payment.paymentDate.substring(0, 10)
        : "" // ensures correct format for date input
    };
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
    />
  );
};

export default PaymentForm;
