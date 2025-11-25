import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import LoadingScreen from "../../components/LoadingScreen";

const CrudFormPage = ({
  title,
  schema,
  defaultValues,
  fields,
  createFn,
  updateFn,
  fetcher,
  redirectPath
}) => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues
  });

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !fetcher) return;
      setLoading(true);
      try {
        const response = await fetcher(id);
        reset(response);
      } catch (error) {
        console.error(`Unable to load ${title} record`, error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher, id, isEdit, reset, title]);

  const onSubmit = async (values) => {
    try {
      if (isEdit && updateFn) {
        await updateFn(id, values);
      } else if (!isEdit && createFn) {
        await createFn(values);
      }
      navigate(redirectPath);
    } catch (error) {
      console.error("Unable to save data", error);
    }
  };

  if (loading) {
    return <LoadingScreen label="Loading details..." />;
  }

  return (
    <div>
      <PageHeader
        title={`${isEdit ? "Edit" : "Add"} ${title}`}
        subtitle="Complete the form below"
      />
      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.col || "col-md-6"}
            >
              {field.render ? (
                field.render(control)
              ) : (
                <FormInput
                  control={control}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  options={field.options || []}
                  isTextArea={field.isTextArea}
                />
              )}
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate(redirectPath)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrudFormPage;

