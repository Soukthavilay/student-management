import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function ClassGroupPage() {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
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

  const { data: majors = [] } = useQuery({
    queryKey: ['admin-majors', selectedDept],
    queryFn: async () => {
      if (!selectedDept) return [];
      const res = await api.admin.majors(selectedDept);
      return res.data?.data || [];
    },
    enabled: !!selectedDept,
  });

  const { data: classGroups = [] } = useQuery({
    queryKey: ['admin-class-groups', selectedDept],
    queryFn: async () => {
      if (!selectedDept) return [];
      const res = await api.admin.classGroups(selectedDept);
      return res.data?.data || [];
    },
    enabled: !!selectedDept,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.admin.createClassGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-class-groups', selectedDept] });
      setIsCreating(false);
      setFormData({ code: '', name: '' });
      setSelectedMajor('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.admin.updateClassGroup(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-class-groups', selectedDept] });
      setEditingId(null);
      setFormData({ code: '', name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.admin.deleteClassGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-class-groups', selectedDept] });
      setShowConfirm(false);
    },
  });

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim() || !selectedMajor) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const data = {
      code: formData.code,
      name: formData.name,
      departmentId: Number(selectedDept),
      majorId: Number(selectedMajor),
    };

    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (classGroup) => {
    setEditingId(classGroup.id);
    setFormData({ code: classGroup.code, name: classGroup.name });
    setSelectedMajor(classGroup.majorId);
  };

  const handleDelete = (id) => {
    setConfirmAction(() => () => deleteMutation.mutate(id));
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ code: '', name: '' });
    setSelectedMajor('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Lớp học</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo và quản lý lớp học cho từng ngành</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Khoa</label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedMajor('');
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

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Ngành</label>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            disabled={!selectedDept}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          >
            <option value="">-- Chọn ngành --</option>
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.code} - {major.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDept && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {isCreating || editingId ? 'Thêm/Sửa Lớp' : 'Danh sách Lớp'}
              </h2>
              {!isCreating && !editingId && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + Thêm lớp
                </button>
              )}
            </div>

            {isCreating || editingId ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngành <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn ngành --</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.code} - {major.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã Lớp <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: CNTT-K20"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên Lớp <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Lớp CNTT K20"
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
                {classGroups.length > 0 ? (
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-6 py-3 font-medium">Mã Lớp</th>
                        <th className="px-6 py-3 font-medium">Tên Lớp</th>
                        <th className="px-6 py-3 font-medium">Ngành</th>
                        <th className="px-6 py-3 font-medium">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classGroups.map((classGroup) => (
                        <tr key={classGroup.id} className="border-t border-slate-50 hover:bg-slate-50">
                          <td className="px-6 py-3 font-mono text-xs text-slate-600">{classGroup.code}</td>
                          <td className="px-6 py-3 font-medium text-slate-900">{classGroup.name}</td>
                          <td className="px-6 py-3 text-slate-600">
                            {classGroup.major?.code} - {classGroup.major?.name}
                          </td>
                          <td className="px-6 py-3 flex gap-2">
                            <button
                              onClick={() => handleEdit(classGroup)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(classGroup.id)}
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
                    Chưa có lớp nào. Hãy thêm lớp mới.
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
        message="Bạn có chắc chắn muốn xóa lớp này?"
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
