import CrudFormPage from "../common/CrudFormPage";
import * as yup from "yup";
import { userApi } from "../../api";
import { toast } from "react-toastify";

// Validation Schema — PASSWORD REQUIRED
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

// Form fields
const fields = [
  { name: "name", label: "Full Name *" },
  { name: "email", label: "Email *", type: "email" },
  { name: "mobile", label: "Mobile *" },
  { name: "role", label: "Role *", type: "select", options: roleOptions },
  { name: "password", label: "Password *", type: "password" } // required now
];

const UserForm = () => (
  <CrudFormPage
    title="User"
    schema={schema}
    defaultValues={defaultValues}
    fields={fields}
    redirectPath="/users"

    // CREATE USER WITH TOAST
    createFn={async (payload) => {
      try {
        const res = await userApi.createUser(payload);
        toast.success("User created successfully!");
        return res;
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to create user"
        );
        throw err;
      }
    }}

    // UPDATE USER WITH TOAST
    updateFn={async (id, payload) => {
      try {
        const res = await userApi.updateUser(id, payload);
        toast.success("User updated successfully!");
        return res;
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to update user"
        );
        throw err;
      }
    }}

    // Fetch + prefill
    fetcher={async (id) => {
      const { user } = await userApi.getUser(id);
      return {
        ...user,
        password: "" // must re-enter (secure)
      };
    }}
  />
);

export default UserForm;
