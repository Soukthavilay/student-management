import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";

const SCOPE_LABELS = {
  CLASS: "Lớp học",
  SECTION: "Học phần",
};

export default function LecturerAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "SECTION",
    sectionId: "",
    classGroupId: "",
  });

  const sectionsQuery = useQuery({
    queryKey: ["lecturer-sections"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data.sections || [];
    },
  });

  const announcementsQuery = useQuery({
    queryKey: ["lecturer-announcements"],
    queryFn: async () => {
      const response = await api.lecturer.announcements();
      return response.data.announcements || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.lecturer.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecturer-announcements"] });
      setShowForm(false);
      setFormData({
        title: "",
        content: "",
        scope: "SECTION",
        sectionId: "",
        classGroupId: "",
      });
      showToast("Gửi thông báo thành công");
    },
    onError: (e) => showToast(e?.response?.data?.message || "Gửi thông báo thất bại", "error"),
  });

  const sections = sectionsQuery.data || [];
  const announcements = announcementsQuery.data || [];

  // Get unique class groups from sections
  const classGroupsMap = new Map();
  sections.forEach((s) => {
    if (s.classGroup && !classGroupsMap.has(s.classGroup.id)) {
      classGroupsMap.set(s.classGroup.id, s.classGroup);
    }
  });
  const classGroups = Array.from(classGroupsMap.values());

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      content: formData.content,
      scope: formData.scope,
    };
    if (formData.scope === "SECTION") {
      payload.sectionId = Number(formData.sectionId);
    } else {
      payload.classGroupId = Number(formData.classGroupId);
    }
    createMutation.mutate(payload);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Thông báo của tôi</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? "Đóng" : "+ Gửi thông báo"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Gửi thông báo mới">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Tiêu đề">
              <input
                type="text"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Đổi phòng học, Nghỉ học..."
                required
              />
            </FormField>

            <FormField label="Nội dung">
              <textarea
                className="w-full rounded border border-slate-300 px-3 py-2"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung thông báo chi tiết..."
                required
              />
            </FormField>

            <FormField label="Gửi đến">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    value="SECTION"
                    checked={formData.scope === "SECTION"}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value, sectionId: "", classGroupId: "" })}
                  />
                  <span className="text-sm">Học phần cụ thể</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    value="CLASS"
                    checked={formData.scope === "CLASS"}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value, sectionId: "", classGroupId: "" })}
                  />
                  <span className="text-sm">Toàn bộ lớp</span>
                </label>
              </div>
            </FormField>

            {formData.scope === "SECTION" ? (
              <FormField label="Chọn học phần">
                <select
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn học phần --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.subject?.name} ({s.classGroup?.name})
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <FormField label="Chọn lớp">
                <select
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  value={formData.classGroupId}
                  onChange={(e) => setFormData({ ...formData, classGroupId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn lớp --</option>
                  {classGroups.map((cg) => (
                    <option key={cg.id} value={cg.id}>
                      {cg.code} - {cg.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {createMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Huỷ
              </button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard title={`Danh sách thông báo (${announcements.length})`}>
        {announcements.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Bạn chưa gửi thông báo nào
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{ann.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{ann.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span>
                        Gửi đến: {" "}
                        <span className="font-medium text-slate-600">
                          {ann.scope === "SECTION"
                            ? `${ann.section?.code} - ${ann.section?.subject?.name}`
                            : ann.classGroup?.name}
                        </span>
                        <span className="ml-1 text-slate-400">({SCOPE_LABELS[ann.scope]})</span>
                      </span>
                      <span>|</span>
                      <span>{formatDate(ann.createdAt)}</span>
                      <span>|</span>
                      <span>{ann._count?.notifications || 0} sinh viên nhận được</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TableCard>
    </div>
  );
}
