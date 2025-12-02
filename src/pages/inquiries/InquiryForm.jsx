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

// ⭐ VALIDATION SCHEMA (as per your requirement)
const schema = yup.object({
  name: yup.string().required("Prospect name is required"),

  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),

  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile"),

  assignedTo: yup.string().required("Assigned To is required"),

  nextFollowUpDate: yup.string().required("Next Follow-Up date is required"),

  interestLevel: yup.string().required("Interest Level is required"),

  status: yup.string().required("Status is required")
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

  // Fields definition
  const fields = [
    { name: "name", label: "Prospect Name *" },

    { name: "companyName", label: "Company (Optional)" },

    { name: "mobile", label: "Mobile *" },

    { name: "email", label: "Email *", type: "email" },

    { name: "source", label: "Source (Optional)" },
    { name: "name", label: "Prospect Name *" },
    { name: "companyName", label: "Company (Optional)" },
    { name: "mobile", label: "Mobile *" },
    { name: "email", label: "Email (Optional)", type: "email" },
    { name: "source", label: "Source (Optional)" },

    {
      name: "interestLevel",
      label: "Interest Level *",
      type: "select",
      options: INQUIRY_INTEREST_LEVELS
    },

    {
      name: "status",
      label: "Status *",
      type: "select",
      options: INQUIRY_STATUSES
    },

    {
      name: "assignedTo",
      label: "Assigned To *",
      type: "select",
      options: userOptions
    },

    {
      name: "nextFollowUpDate",
      label: "Next Follow-Up *",
      type: "date"
    },

    {
      name: "remarks",
      label: "Remarks (Optional)",
      isTextArea: true,
      col: "col-12"
    }
  ];
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
