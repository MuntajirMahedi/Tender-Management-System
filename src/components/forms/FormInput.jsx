import { Controller } from "react-hook-form";

const FormInput = ({
  control,
  name,
  label,
  type = "text",
  options = [],
  placeholder,
  rules,
  isTextArea = false,
  icon,
  helpText,
  onFieldChange,
  ...rest
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => {
      const hasError = Boolean(fieldState.error);

      const handleChange = (e) => {
        field.onChange(e);
        if (onFieldChange) onFieldChange(name, e.target.value);
      };

      return (
        <div className="mb-4">
          {label && (
            <label htmlFor={name} className="form-label fw-semibold">
              {label}
            </label>
          )}

          <div className="input-group">
            {icon && (
              <span className="input-group-text bg-light">
                <i className={icon}></i>
              </span>
            )}

            {type === "select" ? (
              <select
                {...field}
                id={name}
                className={`form-select ${hasError ? "is-invalid" : ""}`}
                onChange={handleChange}
                {...rest}
              >
                <option value="">Select</option>

                {options.map((opt, index) => (
                  <option
                    key={`${name}-opt-${opt.value || index}`}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : isTextArea ? (
              <textarea
                {...field}
                id={name}
                className={`form-control ${hasError ? "is-invalid" : ""}`}
                placeholder={placeholder}
                rows={rest.rows || 3}
                onChange={handleChange}
                {...rest}
              />
            ) : (
              <input
                {...field}
                id={name}
                type={type}
                className={`form-control ${hasError ? "is-invalid" : ""}`}
                placeholder={placeholder}
                onChange={handleChange}
                {...rest}
              />
            )}

            {hasError && (
              <div className="invalid-feedback d-block">
                {fieldState.error.message}
              </div>
            )}
          </div>

          {helpText && <div className="form-text">{helpText}</div>}
        </div>
      );
    }}
  />
);

export default FormInput;
