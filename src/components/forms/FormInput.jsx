import { Controller } from "react-hook-form";

const FormInput = ({
  control,
  name,
  label,
  type = "text",
  options = [],
  placeholder,
  rules,
  isTextArea,
  as = "input",
  ...rest
}) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field, fieldState }) => (
      <div className="mb-3">
        {label && (
          <label className="form-label" htmlFor={name}>
            {label}
          </label>
        )}
        {type === "select" ? (
          <select
            {...field}
            {...rest}
            id={name}
            className={`form-select ${fieldState.error ? "is-invalid" : ""}`}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : isTextArea ? (
          <textarea
            {...field}
            {...rest}
            id={name}
            className={`form-control ${fieldState.error ? "is-invalid" : ""}`}
            placeholder={placeholder}
            rows={rest.rows || 3}
          />
        ) : (
          <input
            {...field}
            {...rest}
            id={name}
            type={type}
            className={`form-control ${fieldState.error ? "is-invalid" : ""}`}
            placeholder={placeholder}
          />
        )}
        {fieldState.error && (
          <div className="invalid-feedback">{fieldState.error.message}</div>
        )}
      </div>
    )}
  />
);

export default FormInput;

