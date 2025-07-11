/**
 * Reusable Form Field Component
 * Consistent form field styling with proper validation and accessibility
 */

import React, { forwardRef } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
  className?: string;
  fieldClassName?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  options,
  rows = 4,
  className,
  fieldClassName,
  autoComplete,
  min,
  max,
  step,
  pattern,
}, ref) => {
  const hasError = Boolean(error);
  const describedBy = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
  ].filter(Boolean).join(' ') || undefined;

  const commonProps = {
    id,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    'aria-describedby': describedBy,
    'aria-invalid': hasError,
    style: getInputStyles(hasError),
    className: fieldClassName,
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            ref={ref as React.Ref<HTMLSelectElement>}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );
    }
  };

  return (
    <div style={fieldGroupStyles} className={className}>
      <label htmlFor={id} style={labelStyles}>
        {label}
        {required && <span style={requiredStyles} aria-label="required">*</span>}
      </label>
      
      {renderField()}
      
      {hint && !error && (
        <small id={`${id}-hint`} style={hintStyles}>
          {hint}
        </small>
      )}
      
      {error && (
        <small id={`${id}-error`} style={errorStyles} role="alert">
          <ErrorIcon />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Icons
const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Styles
const fieldGroupStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  marginBottom: 'var(--spacing-lg)',
};

const labelStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-primary)',
  transition: 'color var(--transition-normal)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-xs)',
};

const requiredStyles: React.CSSProperties = {
  color: 'var(--color-error-text)',
  fontSize: 'var(--font-size-sm)',
};

const getInputStyles = (hasError: boolean): React.CSSProperties => ({
  padding: 'var(--spacing-md) var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  border: `1px solid ${hasError ? 'var(--color-error-border)' : 'var(--color-border-secondary)'}`,
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-base)',
  transition: 'all var(--transition-normal)',
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.5,
});

const hintStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-secondary)',
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

const errorStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-xs)',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-error-text)',
  marginTop: 'var(--spacing-xs)',
  lineHeight: 1.4,
};

export default FormField;