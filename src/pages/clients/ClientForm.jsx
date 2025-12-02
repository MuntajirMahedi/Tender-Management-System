// src/pages/clients/ClientForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, userApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";

//
// Validation
//
const schema = yup.object({
  name: yup.string().required("Client name is required"),
  mobile: yup.string().required("Mobile number is required"),
  status: yup.string().required("Status is required"),
  assignedSales: yup.string().required("Assigned Sales user is required"),
  assignedCare: yup.string().required("Assigned Care user is required"),
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
  assignedCare: "",
  status: "Onboarding",
};

const ClientForm = () => {
  const [users, setUsers] = useState([]);

  //
  // Load Users for dropdown
  //
  useEffect(() => {
    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch(() => toast.error("Unable to load user list"));
  }, []);

  //
  // User dropdown options
  //
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.id || user._id,
      })),
    [users]
  );

  //
  // ⭐ FIXED Status dropdown options
  //
  const statusOptions = useMemo(
    () =>
      CLIENT_STATUSES.map((st) => ({
        value: st,
        label: st,
      })),
    []
  );

  //
  // Form fields
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
      label: "Assigned Sales *",
      type: "select",
      options: userOptions,
    },

    {
      name: "assignedCare",
      label: "Assigned Care *",
      type: "select",
      options: userOptions,
    },

    {
      name: "status",
      label: "Status *",
      type: "select",
      options: statusOptions, // ⭐ FIXED WORKING DROPDOWN
    },
  ];

  //
  // Transform Payload
  //
  const transformPayload = (payload) => {
    const p = { ...payload };

    p.interestedProducts =
      p.interestedProducts
        ?.split(",")
        .map((x) => x.trim())
        .filter(Boolean) || [];

    return p;
  };

  //
  // Create client
  //
  const createFn = async (payload) => {
    try {
      const res = await clientApi.createClient(transformPayload(payload));
      toast.success("Client created successfully");
      return res;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create client");
      throw error;
    }
  };

  //
  // Update client
  //
  const updateFn = async (id, payload) => {
    try {
      const res = await clientApi.updateClient(id, transformPayload(payload));
      toast.success("Client updated successfully");
      return res;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update client");
      throw error;
    }
  };

  //
  // Prefill on edit
  //
  const fetcher = async (id) => {
    const { client } = await clientApi.getClient(id);

    return {
      ...defaultValues,
      ...client,
      assignedSales:
        client.assignedSales?._id ||
        client.assignedSales?.id ||
        client.assignedSales ||
        "",
      assignedCare:
        client.assignedCare?._id ||
        client.assignedCare?.id ||
        client.assignedCare ||
        "",
      interestedProducts: Array.isArray(client.interestedProducts)
        ? client.interestedProducts.join(", ")
        : client.interestedProducts || "",
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
