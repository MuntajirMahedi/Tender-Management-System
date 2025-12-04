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
  customRender,      // ⭐ SUPPORT ADDED
  onChangeCustom,
  ...rest
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => {
      const hasError = Boolean(fieldState.error);

      const handleChange = (e) => {
        // Block negative & invalid numbers
        if (type === "number") {
          let val = Number(e.target.value);
          if (val < 0) val = 0;
          e.target.value = val;
        }

        field.onChange(e);

        if (onChangeCustom) onChangeCustom(e);
        if (rest.onChange) rest.onChange(e);
      };

      return (
        <div className="mb-3">
          {label && (
            <label htmlFor={name} className="form-label fw-semibold">
              {label}
            </label>
          )}

          {/* ⭐ CUSTOM RENDER BLOCK ADDED */}
          {customRender ? (
            <>
              {customRender({
                value: field.value,
                onChange: field.onChange
              })}

              {hasError && (
                <div className="invalid-feedback d-block">
                  {fieldState.error.message}
                </div>
              )}

              {helpText && <div className="form-text">{helpText}</div>}
            </>
          ) : (
            <>
              <div className="input-group">

                {type === "select" ? (
                  <select
                    id={name}
                    value={field.value ?? ""}
                    className={`form-select ${hasError ? "is-invalid" : ""}`}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {options.map((opt, idx) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : isTextArea ? (
                  <textarea
                    id={name}
                    value={field.value ?? ""}
                    className={`form-control ${hasError ? "is-invalid" : ""}`}
                    placeholder={placeholder}
                    rows={rest.rows || 3}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    id={name}
                    type={type}
                    value={field.value ?? ""}
                    className={`form-control ${hasError ? "is-invalid" : ""}`}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (type === "number") {
                        if (["-", "e", "+", ","].includes(e.key)) {
                          e.preventDefault();
                        }
                      }
                    }}
                  />
                )}

                {hasError && (
                  <div className="invalid-feedback d-block">
                    {fieldState.error.message}
                  </div>
                )}
              </div>

              {helpText && <div className="form-text">{helpText}</div>}
            </>
          )}
        </div>
      );
    }}
  />
);

export default FormInput;
