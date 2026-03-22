import React from 'react';

export function FormError({ error, className = '' }) {
  if (!error) return null;

  return (
    <div className={`text-red-600 text-sm mt-1 ${className}`}>
      {error}
    </div>
  );
}

export function FormField({ 
  label, 
  error, 
  required = false, 
  children,
  className = '',
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      <FormError error={error} />
    </div>
  );
}

export function FormInput({
  label,
  error,
  required = false,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <FormField label={label} error={error} required={required}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''} ${className}`}
      />
    </FormField>
  );
}

export function FormSelect({
  label,
  error,
  required = false,
  placeholder,
  value,
  onChange,
  options = [],
  disabled = false,
  className = '',
}) {
  return (
    <FormField label={label} error={error} required={required}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function FormTextarea({
  label,
  error,
  required = false,
  placeholder,
  value,
  onChange,
  disabled = false,
  rows = 4,
  className = '',
}) {
  return (
    <FormField label={label} error={error} required={required}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''} ${className}`}
      />
    </FormField>
  );
}
