import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, renewalApi } from "../../api";
import { RENEWAL_TYPES } from "../../utils/constants";

// Backend required validations only
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  durationMonths: yup.number().required("Duration is required")
});

// Default values
const defaultValues = {
  clientId: "",
  planId: "",
  previousStartDate: "",
  previousExpiryDate: "",
  newStartDate: "",
  newExpiryDate: "",
  durationMonths: 12,
  renewalType: "ExtendSamePlan",
  notes: ""
};

const RenewalForm = () => {
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

    { name: "newStartDate", label: "New Start (Optional)", type: "date" },
    { name: "newExpiryDate", label: "New Expiry (Optional)", type: "date" },

    {
      name: "durationMonths",
      label: "Duration (months) *",
      type: "number"
    },

    {
      name: "renewalType",
      label: "Renewal Type (Optional)",
      type: "select",
      options: RENEWAL_TYPES
    },

    { name: "notes", label: "Notes (Optional)", isTextArea: true, col: "col-12" }
  ];

  return (
    <CrudFormPage
      title="Renewal"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={renewalApi.createRenewal}
      updateFn={null}
      fetcher={null}
      redirectPath="/renewals"
    />
  );
};

export default RenewalForm;
