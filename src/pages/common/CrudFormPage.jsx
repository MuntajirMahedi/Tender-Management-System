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
  redirectPath,
  onFieldChange
}) => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues
  });

  const values = watch();

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !fetcher) return;
      setLoading(true);

      try {
        const response = await fetcher(id);
        reset(response);
      } catch (error) {
        console.error("Error loading record:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetcher, id, isEdit, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) await updateFn(id, values);
      else await createFn(values);

      navigate(redirectPath);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (loading) return <LoadingScreen label="Loading..." />;

  return (
    <div>
      <PageHeader title={`${isEdit ? "Edit" : "Add"} ${title}`} />

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-4">
              {fields.map((field) => (
                <div key={field.name} className={field.col || "col-md-6"}>
                  <FormInput
                    control={control}
                    {...field}
                    onChangeCustom={(e) => {
                      setValue(field.name, e.target.value);

                      if (field.onChange) {
                        field.onChange(e, setValue);
                      }

                      // ⭐ MAIN FIX — now sending setValue also
                      if (onFieldChange) {
                        onFieldChange(field.name, e.target.value, values, setValue);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => navigate(redirectPath)}
                className="btn btn-light border"
              >
                Cancel
              </button>
              <button disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrudFormPage;
