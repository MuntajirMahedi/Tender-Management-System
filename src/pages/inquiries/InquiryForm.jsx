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

// ⭐ PHONE INPUT IMPORT (correct CSS)
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ⭐ VALIDATION SCHEMA
const schema = yup.object({
  name: yup.string().required("Prospect name is required"),

  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
      "Enter a valid email address"
    ),

  mobile: yup.string().required("Mobile number is required"),
  assignedTo: yup.string().required("Assigned To is required"),
  nextFollowUpDate: yup.string().required("Next Follow-Up date is required"),
  interestLevel: yup.string().required("Interest Level is required"),
  status: yup.string().required("Status is required")
});

// ⭐ DEFAULT VALUES
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

  // Fetch users
  useEffect(() => {
    userApi
      .getUsers()
      .then((res) => setUsers(res.users || []))
      .catch(() => {
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

  const interestLevelOptions = INQUIRY_INTEREST_LEVELS.map((lvl) => ({
    value: lvl,
    label: lvl
  }));

  const statusOptions = INQUIRY_STATUSES.map((st) => ({
    value: st,
    label: st
  }));

  // ⭐ FIELDS CONFIG
  const fields = [
    { name: "name", label: "Prospect Name *" },
    { name: "companyName", label: "Company (Optional)" },

    // ⭐ MOBILE FIELD — PERFECT HEIGHT + FLAG + COUNTRY CODE
    {
      name: "mobile",
      label: "Mobile *",
      customRender: ({ value, onChange }) => (
        <PhoneInput
          country={"in"}
          enableSearch={true}
          value={value}
          onChange={(phone) => onChange(phone)}
          containerClass="w-100"
          inputClass="form-control"

          // ⭐ PERFECT HEIGHT FIX (Bootstrap matching)
          inputStyle={{
            height: "38px",
            fontSize: "14px"
          }}
          buttonStyle={{
            height: "38px",
            border: "1px solid #ced4da",
            backgroundColor: "#f8f9fa"
          }}
        />
      )
    },

    { name: "email", label: "Email *", type: "email" },
    { name: "source", label: "Source (Optional)" },

    {
      name: "interestLevel",
      label: "Interest Level *",
      type: "select",
      options: interestLevelOptions
    },
    {
      name: "status",
      label: "Status *",
      type: "select",
      options: statusOptions
    },
    {
      name: "assignedTo",
      label: "Assigned To *",
      type: "select",
      options: userOptions
    },
    { name: "nextFollowUpDate", label: "Next Follow-Up *", type: "date" },

    {
      name: "remarks",
      label: "Remarks (Optional)",
      isTextArea: true,
      col: "col-12"
    }
  ];

  // ⭐ CREATE
  const createFn = async (payload) => {
    try {
      const res = await inquiryApi.createInquiry(payload);
      toast.success("Inquiry created successfully");
      return res;
    } catch (err) {
      toast.error("Failed to create inquiry");
      throw err;
    }
  };

  // ⭐ UPDATE
  const updateFn = async (id, payload) => {
    try {
      const res = await inquiryApi.updateInquiry(id, payload);
      toast.success("Inquiry updated successfully");
      return res;
    } catch (err) {
      toast.error("Failed to update inquiry");
      throw err;
    }
  };

  // ⭐ EDIT FETCHER
  const fetcher = async (id) => {
    const { inquiry } = await inquiryApi.getInquiry(id);

    return {
      ...defaultValues,
      ...inquiry,
      assignedTo: inquiry.assignedTo?._id || inquiry.assignedTo || ""
    };
  };

  return (
    <CrudFormPage
      title="Inquiry"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      createFn={createFn}
      updateFn={updateFn}
      fetcher={fetcher}
      redirectPath="/inquiries"
    />
  );
};

export default InquiryForm;
