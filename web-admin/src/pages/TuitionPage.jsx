import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

function formatCurrency(amount) {
  if (!amount || amount === 0) return "0";
  return amount.toLocaleString("vi-VN");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ConfigDialog({ config, semesters, onClose, onSave }) {
  const [semesterId, setSemesterId] = useState(config?.semesterId?.toString() || "");
  const [creditPrice, setCreditPrice] = useState(config?.creditPrice || 500000);
  const [isActive, setIsActive] = useState(config?.isActive ?? true);

  const isEditing = !!config?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          {isEditing ? "Cập nhật" : "Thêm"} giá tín chỉ
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Học kỳ áp dụng</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                disabled={isEditing}
              >
                <option value="">-- Chọn học kỳ --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.academicYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Giá / tín chỉ (VNĐ)
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={creditPrice}
              onChange={(e) => setCreditPrice(Number(e.target.value))}
              placeholder="500000"
              step="1000"
            />
            <p className="mt-1 text-xs text-slate-500">
              Ví dụ: 500,000đ = 500 nghìn đồng mỗi tín chỉ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Đang áp dụng
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={!semesterId}
            onClick={() => onSave({ semesterId: Number(semesterId), creditPrice, isActive })}
          >
            {isEditing ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateDialog({ students, semesters, onClose, onGenerate }) {
  const [studentId, setStudentId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const selectedStudent = students.find((s) => s.id === Number(studentId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Tạo học phí</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sinh viên</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-3"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Chọn sinh viên --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentCode} - {s.user?.fullName}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm font-medium text-slate-700">Học kỳ</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.academicYear})
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              Hệ thống sẽ tự động tìm các học kỳ sinh viên đã đăng ký và tạo học phí dựa trên cấu hình giá tín chỉ.
            </p>
          </div>

          {selectedStudent && (
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500 mb-1">Sinh viên đã chọn:</p>
              <p className="text-sm font-medium text-slate-900">
                {selectedStudent.studentCode} - {selectedStudent.user?.fullName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Chương trình: {selectedStudent.department?.name || "Chưa có"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={!studentId || !semesterId}
            onClick={() =>
              onGenerate({
                studentId: Number(studentId),
                semesterId: Number(semesterId),
              })
            }
          >
            Tạo học phí
          </button>
        </div>
      </div>
    </div>
  );
}

function SemesterFeeTable({ tuitionFee, onDelete }) {
  const semesterTotals = {
    amountDue: 0,
    amountPaid: 0,
    discount: 0,
    debt: 0,
    credits: 0,
  };

  tuitionFee.items.forEach((item) => {
    semesterTotals.amountDue += item.amountDue;
    semesterTotals.amountPaid += item.amountPaid;
    semesterTotals.discount += item.discount;
    semesterTotals.debt += item.debt;
    semesterTotals.credits += item.credits || 0;
  });

  // Get credit price from first item
  const creditPrice = tuitionFee.items[0]?.creditPrice || 0;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between bg-[#1E3A5F] px-4 py-3">
        <div>
          <span className="text-sm font-semibold text-white">
            {tuitionFee.semester?.name} ({tuitionFee.semester?.academicYear})
          </span>
          {tuitionFee.student && (
            <span className="ml-3 text-xs text-blue-200">
              {tuitionFee.student.studentCode} - {tuitionFee.student.user?.fullName}
            </span>
          )}
          {creditPrice > 0 && (
            <span className="ml-3 text-xs text-green-300">
              Giá: {formatCurrency(creditPrice)}đ/tín chỉ
            </span>
          )}
        </div>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100"
          onClick={() => onDelete(tuitionFee.id)}
        >
          Xoá
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <th className="px-4 py-2">Mã phí - Tên phí</th>
            <th className="px-4 py-2 text-right w-20">Tín chỉ</th>
            <th className="px-4 py-2 text-right w-28">Đơn giá</th>
            <th className="px-4 py-2 text-right w-28">Phải đóng</th>
            <th className="px-4 py-2 text-right w-28">Đã đóng</th>
            <th className="px-4 py-2 text-right w-28">Còn nợ</th>
          </tr>
        </thead>
        <tbody>
          {tuitionFee.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-700">
                {item.name}
                {item.credits > 0 && (
                  <span className="ml-1 text-xs text-slate-500">({item.credits} tc)</span>
                )}
              </td>
              <td className="px-4 py-2 text-right">{item.credits || 0}</td>
              <td className="px-4 py-2 text-right text-slate-500">
                {item.creditPrice > 0 ? formatCurrency(item.creditPrice) : "-"}
              </td>
              <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.amountDue)}</td>
              <td className="px-4 py-2 text-right font-medium text-green-600">
                {formatCurrency(item.amountPaid)}
              </td>
              <td className={`px-4 py-2 text-right font-medium ${item.debt > 0 ? "text-red-600" : ""}`}>
                {formatCurrency(item.debt)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-orange-50 font-semibold text-orange-800">
            <td className="px-4 py-2">
              Tổng học phí: {tuitionFee.semester?.name}
            </td>
            <td className="px-4 py-2 text-right">{semesterTotals.credits} tc</td>
            <td className="px-4 py-2 text-right">-</td>
            <td className="px-4 py-2 text-right">{formatCurrency(semesterTotals.amountDue)}</td>
            <td className="px-4 py-2 text-right">{formatCurrency(semesterTotals.amountPaid)}</td>
            <td className="px-4 py-2 text-right">{formatCurrency(semesterTotals.debt)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function TuitionPage() {
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterSemesterId, setFilterSemesterId] = useState("");

  const { data: studentsData } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => api.admin.students({ pageSize: 1000 }),
    select: (res) => res.data?.data || [],
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["tuition-configs"],
    queryFn: () => api.admin.tuitionConfigs(),
    select: (res) => res.data?.data || [],
  });

  const { data: tuitionFees = [], isLoading } = useQuery({
    queryKey: ["tuition-fees", filterStudentId, filterSemesterId],
    queryFn: () =>
      api.admin.tuitionFees({ 
        ...(filterStudentId ? { studentId: filterStudentId } : {}),
        ...(filterSemesterId ? { semesterId: filterSemesterId } : {}),
      }),
    select: (res) => res.data?.data || [],
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: () => api.admin.semesters(),
    select: (res) => res.data?.data || [],
  });

  const generateMutation = useMutation({
    mutationFn: (payload) => api.admin.generateTuitionFees(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
      setShowGenerate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.admin.deleteTuitionFee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
    },
  });

  const configMutation = useMutation({
    mutationFn: (payload) => api.admin.upsertTuitionConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-configs"] });
      setShowConfig(false);
      setEditingConfig(null);
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id) => api.admin.deleteTuitionConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-configs"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá bản ghi học phí này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteConfig = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá cấu hình giá này?")) {
      deleteConfigMutation.mutate(id);
    }
  };

  // Calculate grand totals
  const grandTotals = { amountDue: 0, amountPaid: 0, discount: 0, debt: 0 };
  tuitionFees.forEach((tf) => {
    tf.items?.forEach((item) => {
      grandTotals.amountDue += item.amountDue;
      grandTotals.amountPaid += item.amountPaid;
      grandTotals.discount += item.discount;
      grandTotals.debt += item.debt;
    });
  });

  const students = studentsData || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý học phí</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setEditingConfig(null);
              setShowConfig(true);
            }}
          >
            ⚙️ Cấu hình giá tín chỉ
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            onClick={() => setShowGenerate(true)}
          >
            + Tạo học phí
          </button>
        </div>
      </div>

      {/* Config Table */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-medium text-slate-700">Cấu hình giá tín chỉ</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
              <th className="px-4 py-2">Học kỳ</th>
              <th className="px-4 py-2 text-right">Giá / tín chỉ</th>
              <th className="px-4 py-2 text-center">Trạng thái</th>
              <th className="px-4 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Chưa có cấu hình giá tín chỉ. Vui lòng thêm mới!
                </td>
              </tr>
            ) : (
              configs.map((config) => (
                <tr key={config.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">{config.semester?.name} ({config.semester?.academicYear})</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(config.creditPrice)}đ
                  </td>
                  <td className="px-4 py-2 text-center">
                    {config.isActive ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Đang áp dụng
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        Ngưng
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      className="mr-2 text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setEditingConfig(config);
                        setShowConfig(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteConfig(config.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      {tuitionFees.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Tổng phải đóng</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(grandTotals.amountDue)} đ</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Tổng đã đóng</p>
            <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(grandTotals.amountPaid)} đ</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Tổng miễn giảm</p>
            <p className="mt-1 text-xl font-bold text-blue-600">{formatCurrency(grandTotals.discount)} đ</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Tổng còn nợ</p>
            <p className={`mt-1 text-xl font-bold ${grandTotals.debt > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(grandTotals.debt)} đ
            </p>
          </div>
        </div>
      )}

      {/* Fee Tables */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Đang tải...</div>
      ) : tuitionFees.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-slate-400">
          Chưa có dữ liệu học phí
        </div>
      ) : (
        tuitionFees.map((tf) => (
          <SemesterFeeTable
            key={tf.id}
            tuitionFee={tf}
            onDelete={handleDelete}
          />
        ))
      )}

      {showGenerate && (
        <GenerateDialog
          students={students}
          semesters={semesters}
          onClose={() => setShowGenerate(false)}
          onGenerate={(payload) => generateMutation.mutate(payload)}
        />
      )}

      {showConfig && (
        <ConfigDialog
          config={editingConfig}
          semesters={semesters}
          onClose={() => {
            setShowConfig(false);
            setEditingConfig(null);
          }}
          onSave={(payload) => configMutation.mutate(payload)}
        />
      )}
    </div>
  );
}
