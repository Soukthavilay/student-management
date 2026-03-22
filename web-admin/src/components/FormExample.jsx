import React, { useState } from 'react';
import { useFormHandler } from '../hooks/useFormHandler';
import { ConfirmDialog } from './ConfirmDialog';
import { FormInput, FormSelect, FormTextarea } from './FormError';

// Example component showing how to use useFormHandler
export function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    description: '',
  });

  const { 
    loading, 
    errors, 
    showConfirm, 
    handleSubmit, 
    handleConfirm, 
    handleCancel 
  } = useFormHandler(
    async (data) => {
      // Call API here
      console.log('Submitting:', data);
      // await api.post('/endpoint', data);
    }
  );

  const validationRules = {
    name: { 
      required: true, 
      minLength: 3,
      maxLength: 100,
    },
    email: { 
      required: true, 
      email: true,
    },
    department: { 
      required: true,
    },
    description: { 
      maxLength: 500,
    },
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    await handleSubmit(
      formData,
      validationRules,
      'Bạn có chắc chắn muốn lưu thông tin này?'
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          label="Tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Nhập tên"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="Nhập email"
        />

        <FormSelect
          label="Khoa"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          required
          placeholder="Chọn khoa"
          options={[
            { value: 'cntt', label: 'Công nghệ Thông tin' },
            { value: 'kinh-te', label: 'Kinh tế' },
            { value: 'dien', label: 'Điện' },
          ]}
        />

        <FormTextarea
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Nhập mô tả (tối đa 500 ký tự)"
          rows={4}
        />

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Đang xử lý...' : 'Lưu'}
        </button>
      </form>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận lưu"
        message="Bạn có chắc chắn muốn lưu thông tin này?"
        confirmText="Lưu"
        cancelText="Hủy"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  );
}
