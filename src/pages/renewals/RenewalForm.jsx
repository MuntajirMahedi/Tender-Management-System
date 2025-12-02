// src/pages/renewals/RenewalForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, renewalApi } from "../../api";
import { RENEWAL_TYPES } from "../../utils/constants";

// ✅ Validation
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planId: yup.string().required("Plan is required"),
  newStartDate: yup.string().required("Start Date is required"),
  durationMonths: yup
    .number()
    .typeError("Duration must be a number")
    .required("Duration is required")
});

// Default values
const defaultValues = {
  clientId: "",
  planId: "",
  newStartDate: "",
  durationMonths: 12,
  renewalType: "ExtendSamePlan",
  notes: ""
};

const RenewalForm = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const { id } = useParams();
  const isEditing = Boolean(id);

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
        label: `${plan.planName} — ${plan.client?.name || ""}`
      })),
    [plans]
  );

  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions
    },
    {
      name: "planId",
      label: "Plan *",
      type: "select",
      options: planOptions
    },

    {
      name: "newStartDate",
      label: "Start Date *",
      type: "date"
    },

    {
      name: "durationMonths",
      label: "Duration (Months) *",
      type: "number"
    },

    {
      name: "renewalType",
      label: "Renewal Type (Optional)",
      type: "select",
      options: RENEWAL_TYPES
    },

    {
      name: "notes",
      label: "Notes (Optional)",
      isTextArea: true,
      col: "col-12"
    }
  ];

  // ✅ Create with toast
  const createFn = async (payload) => {
    try {
      const res = await renewalApi.createRenewal(payload);
      toast.success("Renewal created successfully");
      return res;
    } catch (err) {
      console.error("Failed to create renewal", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create renewal";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Update with toast
  const updateFn = async (renewalId, payload) => {
    try {
      // make sure you have this API; if not, create it similar to others
      const res = await renewalApi.updateRenewal(renewalId, payload);
      toast.success("Renewal updated successfully");
      return res;
    } catch (err) {
      console.error("Failed to update renewal", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update renewal";
      toast.error(msg);
      throw err;
    }
  };

  // ✅ Prefill edit form
  const fetcher = async (renewalId) => {
    // you don't have a getRenewal(id) helper in the code you showed,
    // so we reuse getRenewals() + find (same as your RenewalView).
    const res = await renewalApi.getRenewals();
    const renewal =
      (res.renewals || []).find(
        (item) => (item.id || item._id) === renewalId
      ) || null;

    if (!renewal) {
      throw new Error("Renewal not found");
    }

    return {
      ...defaultValues,
      clientId: renewal.client?._id || renewal.client || "",
      planId: renewal.plan?._id || renewal.plan || "",
      newStartDate: renewal.newStartDate
        ? renewal.newStartDate.substring(0, 10)
        : "",
      durationMonths: renewal.durationMonths || 12,
      renewalType: renewal.renewalType || "ExtendSamePlan",
      notes: renewal.notes || ""
    };
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
    />
  );
};

export default RenewalForm;
