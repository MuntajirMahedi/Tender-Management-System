// src/pages/users/UserForm.jsx
import { useEffect, useMemo, useState } from "react";
import CrudFormPage from "../common/CrudFormPage";
import * as yup from "yup";
import { userApi, roleApi } from "../../api";
import { toast } from "react-toastify";

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

  // ⭐ Load roles dynamically from API
  useEffect(() => {
    roleApi
      .getRoles()
      .then((res) => setRoles(res.roles || []))
      .catch(() => toast.error("Failed to load roles"));
  }, []);

  // ⭐ Convert to dropdown format
  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.key || r._id, // key preferred
        label: r.name
      })),
    [roles]
  );

  // Form fields
  const fields = [
    { name: "name", label: "Full Name *" },
    { name: "email", label: "Email *", type: "email" },
    { name: "mobile", label: "Mobile *" },

    // ⭐ dynamic dropdown
    { name: "role", label: "Role *", type: "select", options: roleOptions },

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
          password: "" // password never prefill
        };
      }}
    />
  );
};

export default UserForm;
