import CrudFormPage from "../common/CrudFormPage";
import * as yup from "yup";
import { userApi } from "../../api";

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  mobile: yup.string().required("Mobile is required"),
  role: yup.string().required("Role is required"),
  password: yup.string().notRequired()   // password required only on create
});

// Default values
const defaultValues = {
  name: "",
  email: "",
  mobile: "",
  role: "sales",
  password: ""
};

// Role dropdown
const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "care", label: "Care" },
  { value: "viewer", label: "Viewer" }
];

// Fields with proper labels
const fields = [
  { name: "name", label: "Full Name *" },
  { name: "email", label: "Email *", type: "email" },
  { name: "mobile", label: "Mobile *" },
  { name: "role", label: "Role *", type: "select", options: roleOptions },

  // password optional on edit
  { name: "password", label: "Password (Optional)", type: "password" }
];

const UserForm = () => (
  <CrudFormPage
    title="User"
    schema={schema}
    defaultValues={defaultValues}
    fields={fields}
    createFn={async (payload) => {
      return userApi.createUser(payload); // password required here
    }}
    updateFn={async (id, payload) => {
      if (!payload.password) delete payload.password; // don't send empty password
      return userApi.updateUser(id, payload);
    }}
    fetcher={async (id) => {
      const { user } = await userApi.getUser(id);
      return {
        ...user,
        password: "" // don’t prefill password
      };
    }}
    redirectPath="/users"
  />
);

export default UserForm;
