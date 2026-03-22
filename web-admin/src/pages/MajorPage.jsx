import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function MajorPage() {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const res = await api.admin.departments();
      return res.data?.data || [];
    },
  });

  const { data: majors = [], isLoading } = useQuery({
    queryKey: ['admin-majors', selectedDept],
    queryFn: async () => {
      if (!selectedDept) return [];
      const res = await api.admin.majors(selectedDept);
      return res.data?.data || [];
    },
    enabled: !!selectedDept,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.admin.createMajor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors', selectedDept] });
      setIsCreating(false);
      setFormData({ code: '', name: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.admin.updateMajor(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors', selectedDept] });
      setEditingId(null);
      setFormData({ code: '', name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.admin.deleteMajor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors', selectedDept] });
      setShowConfirm(false);
    },
  });

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate({
        ...formData,
        departmentId: Number(selectedDept),
      });
    }
  };

  const handleEdit = (major) => {
    setEditingId(major.id);
    setFormData({ code: major.code, name: major.name });
  };

  const handleDelete = (id) => {
    setConfirmAction(() => () => deleteMutation.mutate(id));
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ code: '', name: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Ngành học</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo và quản lý ngành học cho từng khoa</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Khoa</label>
        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setIsCreating(false);
            setEditingId(null);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn khoa --</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.code} - {dept.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDept && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {isCreating || editingId ? 'Thêm/Sửa Ngành' : 'Danh sách Ngành'}
              </h2>
              {!isCreating && !editingId && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + Thêm ngành
                </button>
              )}
            </div>

            {isCreating || editingId ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã Ngành</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: CNTT-SE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ngành</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Kỹ sư Phần mềm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {majors.length > 0 ? (
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-6 py-3 font-medium">Mã Ngành</th>
                        <th className="px-6 py-3 font-medium">Tên Ngành</th>
                        <th className="px-6 py-3 font-medium">Lớp</th>
                        <th className="px-6 py-3 font-medium">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {majors.map((major) => (
                        <tr key={major.id} className="border-t border-slate-50 hover:bg-slate-50">
                          <td className="px-6 py-3 font-mono text-xs text-slate-600">{major.code}</td>
                          <td className="px-6 py-3 font-medium text-slate-900">{major.name}</td>
                          <td className="px-6 py-3 text-slate-600">
                            {major.classGroups?.length || 0}
                          </td>
                          <td className="px-6 py-3 flex gap-2">
                            <button
                              onClick={() => handleEdit(major)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(major.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Chưa có ngành nào. Hãy thêm ngành mới.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa ngành này?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => confirmAction && confirmAction()}
        onCancel={() => setShowConfirm(false)}
        isLoading={deleteMutation.isPending}
        isDangerous={true}
      />
    </div>
  );
}
