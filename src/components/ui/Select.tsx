"use client";

import { SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, placeholder, id, className = "", required, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-heading">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`rounded-[var(--radius-control)] border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary-light)] ${
            error
              ? "border-danger focus:border-danger"
              : "border-[var(--color-border)] focus:border-primary"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
