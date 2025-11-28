// src/pages/clients/ClientForm.jsx
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { clientApi, userApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";

//
// ✅ Validation — required fields
//
const schema = yup.object({
  name: yup.string().required("Client name is required"),
  mobile: yup.string().required("Mobile number is required"),
  status: yup.string().required("Status is required"),

  // NOW BOTH REQUIRED
  assignedSales: yup.string().required("Assigned Sales user is required"),
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
  assignedSales: "", // required in UI
  assignedCare: "",  // required in UI
  status: "Onboarding"
};

const ClientForm = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch((error) => {
        console.error("Unable to fetch users", error);
        toast.error("Unable to load users for assignment");
      });
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
  // Fields List with updated required labels
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
      options: userOptions
    },

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
  // Create + Update with toast + transform
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

  const createFn = async (payload) => {
    try {
      const res = await clientApi.createClient(transformPayload(payload));
      toast.success("Client created successfully");
      return res;
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create client";
      toast.error(msg);
      throw error;
    }
  };

  const updateFn = async (id, payload) => {
    try {
      const res = await clientApi.updateClient(id, transformPayload(payload));
      toast.success("Client updated successfully");
      return res;
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update client";
      toast.error(msg);
      throw error;
    }
  };

  const fetcher = async (id) => {
    const { client } = await clientApi.getClient(id);

    const interestedProducts = Array.isArray(client.interestedProducts)
      ? client.interestedProducts.join(", ")
      : client.interestedProducts || "";

    // Normalize assignedSales / assignedCare (could be id or object)
    const assignedSales =
      client.assignedSales?._id ||
      client.assignedSales?.id ||
      client.assignedSales ||
      "";

    const assignedCare =
      client.assignedCare?._id ||
      client.assignedCare?.id ||
      client.assignedCare ||
      "";

    return {
      ...defaultValues, // ensure all keys exist
      ...client,
      interestedProducts,
      assignedSales,
      assignedCare
    };
  };

  return (
    <CrudFormPage
      title="Client"
      subtitle=""            // ✅ remove "Fill out form carefully"
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
