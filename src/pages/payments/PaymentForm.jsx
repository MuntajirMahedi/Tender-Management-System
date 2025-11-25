import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, paymentApi, planApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";

// Required Validation (only backend required)
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  amount: yup.number().required("Amount is required"),
  paymentMode: yup.string().required("Payment mode is required")
});

const defaultValues = {
  clientId: "",
  planId: "",
  amount: "",
  paymentDate: "",
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
    { name: "amount", label: "Amount *", type: "number" },
    { name: "paymentDate", label: "Payment Date (Optional)", type: "date" },
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

  return (
    <CrudFormPage
      title="Payment"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={paymentApi.createPayment}
      updateFn={(id, payload) => paymentApi.updatePayment(id, payload)}
      fetcher={async (id) => {
        const { payment } = await paymentApi.getPayment(id);

        return {
          ...payment,
          clientId: payment.client?._id || payment.client,
          planId: payment.plan?._id || payment.plan
        };
      }}
      redirectPath="/payments"
    />
  );
};

export default PaymentForm;
