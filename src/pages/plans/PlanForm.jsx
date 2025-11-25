import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, planApi, userApi } from "../../api";
import { PLAN_TYPES, PLAN_STATUSES } from "../../utils/constants";

// ✅ Validation — only backend required fields
const schema = yup.object({
  clientId: yup.string().required("Client is required"),
  planType: yup.string().required("Plan type is required"),
  planName: yup.string().required("Plan name is required"),
  amount: yup
    .number()
    .typeError("Amount must be a valid number")
    .required("Amount is required")
});

// Default values
const defaultValues = {
  clientId: "",
  planName: "",
  planType: "Tender",
  amount: "",
  discount: 0,
  taxPercent: 18,
  tokenAmount: 0,
  entryDate: "",
  startDate: "",
  durationMonths: 12,
  status: "Pending Activation",
  remarks: "",
  assignedSales: ""
};

const PlanForm = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Load clients + users
  useEffect(() => {
    clientApi.getClients().then((res) => setClients(res.clients || []));
    userApi.getUsers().then((res) => setUsers(res.users || []));
  }, []);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} (${client.clientCode})`,
        value: client.id || client._id
      })),
    [clients]
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.id || user._id
      })),
    [users]
  );

  // Form field definitions
  const fields = [
    {
      name: "clientId",
      label: "Client *",
      type: "select",
      options: clientOptions
    },
    {
      name: "planName",
      label: "Plan Name *"
    },
    {
      name: "planType",
      label: "Plan Type *",
      type: "select",
      options: PLAN_TYPES
    },
    {
      name: "amount",
      label: "Base Amount *",
      type: "number"
    },

    // Optional Fields
    {
      name: "discount",
      label: "Discount (Optional)",
      type: "number"
    },
    {
      name: "taxPercent",
      label: "Tax % (Default: 18%)",
      type: "number"
    },
    {
      name: "tokenAmount",
      label: "Token Amount (Optional)",
      type: "number"
    },
    {
      name: "startDate",
      label: "Start Date (Optional)",
      type: "date"
    },
    {
      name: "durationMonths",
      label: "Duration Months (Default: 12)",
      type: "number"
    },
    {
      name: "status",
      label: "Plan Status (Optional)",
      type: "select",
      options: PLAN_STATUSES
    },
    {
      name: "assignedSales",
      label: "Sales Owner (Optional)",
      type: "select",
      options: userOptions
    },
    {
      name: "remarks",
      label: "Remarks (Optional)",
      isTextArea: true,
      col: "col-12"
    }
  ];

  return (
    <CrudFormPage
      title="Plan"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={planApi.createPlan}
      updateFn={(id, payload) => planApi.updatePlan(id, payload)}
      fetcher={async (id) => {
        const { plan } = await planApi.getPlan(id);
        return {
          ...plan,
          clientId: plan.client?._id || plan.client
        };
      }}
      redirectPath="/plans"
    />
  );
};

export default PlanForm;
