// src/pages/renewals/RenewalForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, renewalApi } from "../../api";
import { RENEWAL_TYPES } from "../../utils/constants";

// Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  newStartDate: yup.string().required("Start Date is required"),
  durationMonths: yup
    .number()
    .typeError("Duration must be a number")
    .required("Duration is required"),
});

// Default values
const defaultValues = {
  clientId: "",
  planId: "",
  newStartDate: "",
  durationMonths: 12,
  renewalType: "ExtendSamePlan",
  notes: "",
};

const RenewalForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const { id } = useParams();
  const isEditing = Boolean(id);

  // Load clients + plans
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

  // Client dropdown
  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id || client._id,
        label: `${client.name} (${client.clientCode || "No Code"})`,
      })),
    [clients]
  );

  // ⭐ Filter Plan list based on selected client
  const planOptions = useMemo(() => {
    if (!selectedClientId) return [];

    return plans
      .filter((p) => String(p.client?._id) === String(selectedClientId))
      .map((plan) => ({
        value: plan.id || plan._id,
        label: `${plan.planName} — ${plan.client?.name || ""}`,
      }));
  }, [plans, selectedClientId]);

  // ⭐ FIX — Convert Renewal Types to dropdown objects
  const renewalTypeOptions = useMemo(
    () =>
      RENEWAL_TYPES.map((t) => ({
        value: t,
        label: t,
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

    {
      name: "newStartDate",
      label: "Start Date *",
      type: "date",
    },

    {
      name: "durationMonths",
      label: "Duration (Months) *",
      type: "number",
    },

    {
      name: "renewalType",
      label: "Renewal Type (Optional)",
      type: "select",
      options: renewalTypeOptions, // FIXED
    },

    {
      name: "notes",
      label: "Notes (Optional)",
      isTextArea: true,
      col: "col-12",
    },
  ];

  // Create function
  const createFn = async (payload) => {
    try {
      const res = await renewalApi.createRenewal(payload);
      toast.success("Renewal created successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create renewal");
      throw err;
    }
  };

  // Update function
  const updateFn = async (renewalId, payload) => {
    try {
      const res = await renewalApi.updateRenewal(renewalId, payload);
      toast.success("Renewal updated successfully");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update renewal");
      throw err;
    }
  };

  // Prefill edit mode
  const fetcher = async (renewalId) => {
    const res = await renewalApi.getRenewals();
    const renewal =
      (res.renewals || []).find(
        (item) => (item.id || item._id) === renewalId
      ) || null;

    if (!renewal) throw new Error("Renewal not found");

    const clientId = renewal.client?._id;
    const planId = renewal.plan?._id;

    setSelectedClientId(clientId);

    return {
      ...defaultValues,
      ...renewal,
      clientId,
      planId,
      newStartDate: renewal.newStartDate
        ? renewal.newStartDate.substring(0, 10)
        : "",
      durationMonths: renewal.durationMonths || 12,
      renewalType: renewal.renewalType || "ExtendSamePlan",
      notes: renewal.notes || "",
    };
  };

  // Handle client selection (filters plan list)
  const handleFieldChange = (name, value) => {
    if (name === "clientId") {
      setSelectedClientId(value);
    }
  };

  return (
    <CrudFormPage
      title="Renewal"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={isEditing ? updateFn : null}
      fetcher={isEditing ? fetcher : null}
      redirectPath="/renewals"
      onFieldChange={handleFieldChange}
    />
  );
};

export default RenewalForm;
