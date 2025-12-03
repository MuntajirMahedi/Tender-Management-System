// src/pages/users/UserForm.jsx
import { useEffect, useMemo, useState } from "react";
import CrudFormPage from "../common/CrudFormPage";
import * as yup from "yup";
import { userApi, roleApi } from "../../api";
import { toast } from "react-toastify";

// ⭐ Phone Input (Country code + Flag)
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  mobile: yup.string().required("Mobile is required"),
  role: yup.string().required("Role is required"),
  password: yup.string().required("Password is required")
});

// Default values
const defaultValues = {
  name: "",
  email: "",
  mobile: "",
  role: "",
  password: ""
};

const UserForm = () => {
  const [roles, setRoles] = useState([]);

  // Load roles dynamically
  useEffect(() => {
    roleApi
      .getRoles()
      .then((res) => setRoles(res.roles || []))
      .catch(() => toast.error("Failed to load roles"));
  }, []);

  // Role dropdown options
  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.key || r._id,
        label: r.name
      })),
    [roles]
  );

  // ⭐ Form Fields (Mobile Input Added)
  const fields = [
    { name: "name", label: "Full Name *" },
    { name: "email", label: "Email *", type: "email" },

    // ⭐ MOBILE with Country Code + Flag
    {
      name: "mobile",
      label: "Mobile *",
      customRender: ({ value, onChange }) => (
        <PhoneInput
          country={"in"}
          enableSearch={true}
          value={value}
          onChange={(phone) => onChange(phone)}
          inputClass="form-control"
          containerClass="w-100"
          inputStyle={{ height: "38px", fontSize: "14px" }}
          buttonStyle={{
            height: "38px",
            border: "1px solid #ced4da",
            backgroundColor: "#f8f9fa"
          }}
        />
      )
    },

    // Role Dropdown
    { name: "role", label: "Role *", type: "select", options: roleOptions },

    // Password
    { name: "password", label: "Password *", type: "password" }
  ];

  return (
    <CrudFormPage
      title="User"
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      redirectPath="/users"
      
      // CREATE USER
      createFn={async (payload) => {
        try {
          const res = await userApi.createUser(payload);
          toast.success("User created successfully");
          return res;
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to create user");
          throw err;
        }
      }}

      // UPDATE USER
      updateFn={async (id, payload) => {
        try {
          const res = await userApi.updateUser(id, payload);
          toast.success("User updated successfully");
          return res;
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to update user");
          throw err;
        }
      }}

      // Prefill user
      fetcher={async (id) => {
        const { user } = await userApi.getUser(id);

        return {
          ...user,
          password: "" // Never prefill password
        };
      }}
    />
  );
};

export default UserForm;
