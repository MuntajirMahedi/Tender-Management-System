import { Controller } from "react-hook-form";

/**
 * A beautifully styled universal form input component
 * Supports:
 * - text, number, email, date, password
 * - textarea
 * - select
 * - error messages
 * - inline help text
 * - icons (optional)
 */
const FormInput = ({
  control,
  name,
  label,
  type = "text",
  options = [],
  placeholder,
  rules,
  isTextArea = false,
  icon, // OPTIONAL icon support: <i className="bi bi-person" />
  helpText, // OPTIONAL note under field
  ...rest
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => {
      const hasError = Boolean(fieldState.error);

      return (
        <div className="mb-4">
          {/* Label */}
          {label && (
            <label htmlFor={name} className="form-label fw-semibold">
              {label}
            </label>
          )}

          <div className="input-group">
            {/* Optional Icon */}
            {icon && (
              <span className="input-group-text bg-light">
                {typeof icon === "string" ? <i className={icon} /> : icon}
              </span>
            )}

            {/* Select Field */}
            {type === "select" ? (
              <select
                {...field}
                id={name}
                className={`form-select ${hasError ? "is-invalid" : ""}`}
                {...rest}
              >
                <option value="">Select</option>
                {options.map((opt) => (
                  <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                  </option>
                ))}
              </select>
            ) : isTextArea ? (
              // Textarea Field
              <textarea
                {...field}
                id={name}
                className={`form-control ${hasError ? "is-invalid" : ""}`}
                placeholder={placeholder}
                rows={rest.rows || 3}
                {...rest}
              />
            ) : (
              // Input Field
              <input
                {...field}
                id={name}
                type={type}
                className={`form-control ${hasError ? "is-invalid" : ""}`}
                placeholder={placeholder}
                {...rest}
              />
            )}

            {/* Error Message */}
            {hasError && (
              <div className="invalid-feedback d-block">
                {fieldState.error.message}
              </div>
            )}
          </div>

          {/* Help Text (Optional) */}
          {helpText && !hasError && (
            <div className="form-text">{helpText}</div>
          )}
        </div>
      );
    }}
  />
);

export default FormInput;
