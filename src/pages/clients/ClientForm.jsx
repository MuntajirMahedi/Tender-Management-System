// src/pages/clients/ClientForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, userApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";

//
// ✅ Validation — backend required + UI required (assignedCare)
//
const schema = yup.object({
  name: yup.string().required("Client name is required"),
  mobile: yup.string().required("Mobile number is required"),
  status: yup.string().required("Status is required"),

  // NEW REQUIRED FIELD (UI requirement)
  assignedCare: yup.string().required("Assigned Care user is required")
});

//
// Default Values
//
const defaultValues = {
  name: "",
  companyName: "",
  mobile: "",
  altMobile: "",
  email: "",
  altEmail: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  website: "",
  category: "",
  purpose: "",
  interestedProducts: "",
  leadSource: "",
  assignedSales: "",
  assignedCare: "", // NOW REQUIRED IN UI
  status: "Onboarding"
};

const ClientForm = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch((error) => console.error("Unable to fetch users", error));
  }, []);

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.id || user._id
      })),
    [users]
  );

  //
  // Fields List with “Optional” and “Required (*)” labels
  //
  const fields = [
    { name: "name", label: "Client Name *" },
    { name: "companyName", label: "Company (Optional)" },
    { name: "mobile", label: "Mobile *" },
    { name: "altMobile", label: "Alt Mobile (Optional)" },
    { name: "email", label: "Email (Optional)", type: "email" },
    { name: "altEmail", label: "Alt Email (Optional)", type: "email" },

    { name: "addressLine1", label: "Address Line 1 (Optional)" },
    { name: "addressLine2", label: "Address Line 2 (Optional)" },
    { name: "city", label: "City (Optional)" },
    { name: "state", label: "State (Optional)" },
    { name: "pincode", label: "Pincode (Optional)" },
    { name: "country", label: "Country (Default: India)" },

    { name: "website", label: "Website (Optional)" },
    { name: "category", label: "Category (Optional)" },
    { name: "purpose", label: "Purpose (Optional)" },

    { name: "interestedProducts", label: "Interested Products (Optional)" },

    { name: "leadSource", label: "Lead Source (Optional)" },

    {
      name: "assignedSales",
      label: "Assigned Sales (Optional)",
      type: "select",
      options: userOptions
    },

    // NOW REQUIRED FIELD
    {
      name: "assignedCare",
      label: "Assigned Care *",
      type: "select",
      options: userOptions
    },

    {
      name: "status",
      label: "Status * (Default: Onboarding)",
      type: "select",
      options: CLIENT_STATUSES
    }
  ];

  //
  // Create + Update transformation
  //
  const createFn = async (payload) => {
    const p = { ...payload };
    p.interestedProducts =
      p.interestedProducts
        ?.split(",")
        .map((x) => x.trim())
        .filter(Boolean) || [];
    return clientApi.createClient(p);
  };

  const updateFn = async (id, payload) => {
    const p = { ...payload };
    p.interestedProducts =
      p.interestedProducts
        ?.split(",")
        .map((x) => x.trim())
        .filter(Boolean) || [];
    return clientApi.updateClient(id, p);
  };

  const fetcher = async (id) => {
    const { client } = await clientApi.getClient(id);
    return {
      ...client,
      interestedProducts: Array.isArray(client.interestedProducts)
        ? client.interestedProducts.join(", ")
        : ""
    };
  };

  return (
    <CrudFormPage
      title="Client"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/clients"
    />
  );
};

export default ClientForm;
