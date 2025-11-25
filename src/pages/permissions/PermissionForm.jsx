import CrudFormPage from "../common/CrudFormPage";
import * as yup from "yup";
import { permissionApi } from "../../api";

const schema = yup.object({
  name: yup.string().required("Permission name is required"),
  code: yup.string().required("Code is required"),
  module: yup.string().required("Module is required"),
  description: yup.string().notRequired()
});

const defaultValues = {
  name: "",
  code: "",
  module: "",
  description: ""
};

const fields = [
  { name: "name", label: "Permission Name" },
  { name: "code", label: "Code" },
  { name: "module", label: "Module" },
  { name: "description", label: "Description", isTextArea: true, col: "col-12" }
];

const PermissionForm = () => (
  <CrudFormPage
    title="Permission"
    schema={schema}
    defaultValues={defaultValues}
    fields={fields}
    createFn={permissionApi.createPermission}
    updateFn={(id, payload) => permissionApi.updatePermission(id, payload)}
    fetcher={async (id) => {
      const { permissions } = await permissionApi.getPermissions();
      return permissions.find(
        (item) =>
          item._id?.toString() === id || item.id === id
      );
    }}
    redirectPath="/permissions"
  />
);

export default PermissionForm;
