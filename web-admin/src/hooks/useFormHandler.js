import { useState } from 'react';

export function useFormHandler(onSubmit, options = {}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const validateForm = (data, rules) => {
    const newErrors = {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];

      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || `${field} là bắt buộc`;
      }

      // Min length validation
      if (rule.minLength && value && value.toString().length < rule.minLength) {
        newErrors[field] = `${field} phải có ít nhất ${rule.minLength} ký tự`;
      }

      // Max length validation
      if (rule.maxLength && value && value.toString().length > rule.maxLength) {
        newErrors[field] = `${field} không được vượt quá ${rule.maxLength} ký tự`;
      }

      // Email validation
      if (rule.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field] = 'Email không hợp lệ';
        }
      }

      // Number validation
      if (rule.number && value) {
        if (isNaN(value)) {
          newErrors[field] = `${field} phải là số`;
        }
      }

      // Min value validation
      if (rule.min !== undefined && value !== '' && Number(value) < rule.min) {
        newErrors[field] = `${field} phải lớn hơn hoặc bằng ${rule.min}`;
      }

      // Max value validation
      if (rule.max !== undefined && value !== '' && Number(value) > rule.max) {
        newErrors[field] = `${field} phải nhỏ hơn hoặc bằng ${rule.max}`;
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        newErrors[field] = rule.customMessage || `${field} không hợp lệ`;
      }
    });

    return newErrors;
  };

  const handleSubmit = async (data, validationRules, confirmMessage = null) => {
    // Validate form
    const newErrors = validateForm(data, validationRules);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    // Show confirm dialog if needed
    if (confirmMessage) {
      setPendingData(data);
      setShowConfirm(true);
      return false;
    }

    // Submit form
    return await submitForm(data);
  };

  const submitForm = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
      setErrors({});
      setShowConfirm(false);
      setPendingData(null);
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      
      // Handle field-specific errors
      if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: errorMessage });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (pendingData) {
      await submitForm(pendingData);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingData(null);
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    loading,
    errors,
    showConfirm,
    handleSubmit,
    handleConfirm,
    handleCancel,
    clearErrors,
    setErrors,
  };
}
