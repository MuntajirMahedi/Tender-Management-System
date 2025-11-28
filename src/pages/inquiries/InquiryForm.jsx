// src/pages/inquiries/InquiryForm.jsx
import { useMemo, useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import CrudFormPage from "../common/CrudFormPage";
import { inquiryApi, userApi } from "../../api";
import {
  INQUIRY_INTEREST_LEVELS,
  INQUIRY_STATUSES
} from "../../utils/constants";

// ✅ Validation: now includes assignedTo as required
const schema = yup.object({
  name: yup.string().required("Prospect name is required"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile"),
  assignedTo: yup
    .string()
    .required("Assigned to is required") // <-- NEW
});

// Default values
const defaultValues = {
  name: "",
  companyName: "",
  mobile: "",
  email: "",
  source: "",
  interestLevel: "Unknown",
  status: "New",
  assignedTo: "",
  nextFollowUpDate: "",
  remarks: ""
};

const InquiryForm = () => {
  const [users, setUsers] = useState([]);

  // Fetch users for dropdown
  useEffect(() => {
    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch((error) => {
        console.error("Unable to load users", error);
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

  // ✅ Wrap API calls to show toast on success / error
  const createInquiry = async (payload) => {
    try {
      const res = await inquiryApi.createInquiry(payload);
      toast.success("Inquiry created successfully");
      return res;
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create inquiry";
      toast.error(msg);
      throw error; // let CrudFormPage handle navigation/state if needed
    }
  };

  const updateInquiry = async (id, payload) => {
    try {
      const res = await inquiryApi.updateInquiry(id, payload);
      toast.success("Inquiry updated successfully");
      return res;
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update inquiry";
      toast.error(msg);
      throw error;
    }
  };

  // ✅ Ensure edit form is fully prefilled & values mapped correctly
  const fetchInquiry = async (id) => {
    const { inquiry } = await inquiryApi.getInquiry(id);

    // Handle different possible shapes of assignedTo (id or object)
    const assignedTo =
      inquiry.assignedTo?._id ||
      inquiry.assignedTo?.id ||
      inquiry.assignedTo ||
      "";

    // Date input needs YYYY-MM-DD
    const nextFollowUpDate = inquiry.nextFollowUpDate
      ? inquiry.nextFollowUpDate.substring(0, 10)
      : "";

    return {
      ...defaultValues, // fallback for any missing fields
      ...inquiry,
      assignedTo,
      nextFollowUpDate
    };
  };

  // Fields definition
  const fields = [
    { name: "name", label: "Prospect Name *" },
    { name: "companyName", label: "Company (Optional)" },
    { name: "mobile", label: "Mobile *" },
    { name: "email", label: "Email (Optional)", type: "email" },
    { name: "source", label: "Source (Optional)" },

    {
      name: "interestLevel",
      label: "Interest Level (Default: Unknown)",
      type: "select",
      options: INQUIRY_INTEREST_LEVELS
    },
    {
      name: "status",
      label: "Status (Default: New)",
      type: "select",
      options: INQUIRY_STATUSES
    },
    {
      name: "assignedTo",
      // ⬇ changed label to required
      label: "Assigned To *",
      type: "select",
      options: userOptions
    },
    {
      name: "nextFollowUpDate",
      label: "Next Follow-Up (Optional)",
      type: "date"
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
      title="Inquiry"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createInquiry}              // ✅ wrapped
      updateFn={updateInquiry}              // ✅ wrapped
      fetcher={fetchInquiry}                // ✅ mapped + prefill
      redirectPath="/inquiries"
    />
  );
};

export default InquiryForm;
