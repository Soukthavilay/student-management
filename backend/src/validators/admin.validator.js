import { z } from "zod";

const baseEnvelope = {
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
};

export const createDepartmentSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2, "Mã khoa phải có ít nhất 2 ký tự"),
    name: z.string().min(2, "Tên khoa phải có ít nhất 2 ký tự"),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    code: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
  }),
});

export const createStudentSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    studentCode: z.string().min(2),
    departmentId: z.coerce.number().int().positive(),
    classGroupId: z.coerce.number().int().positive(),
    phone: z.string().min(8).max(20).optional().nullable(),
    address: z.string().min(3).max(255).optional().nullable(),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    fullName: z.string().min(2).optional(),
    departmentId: z.coerce.number().int().positive().optional(),
    classGroupId: z.coerce.number().int().positive().optional(),
    phone: z.string().min(8).max(20).optional().nullable(),
    address: z.string().min(3).max(255).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createLecturerSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    lecturerCode: z.string().min(2),
    departmentId: z.coerce.number().int().positive(),
    title: z.string().max(50).optional().nullable(),
  }),
});

export const updateLecturerSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    fullName: z.string().min(2).optional(),
    departmentId: z.coerce.number().int().positive().optional(),
    title: z.string().max(50).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const assignLecturerSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    lecturerId: z.coerce.number().int().positive(),
  }),
});

export const createAnnouncementSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    title: z.string().min(2),
    content: z.string().min(2),
    scope: z.enum(["ALL", "DEPARTMENT", "CLASS", "SECTION"]),
    departmentId: z.coerce.number().int().positive().optional().nullable(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    sectionId: z.coerce.number().int().positive().optional().nullable(),
  }),
});

export const createClassGroupSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2),
    name: z.string().min(2),
    departmentId: z.coerce.number().int().positive(),
  }),
});

export const updateClassGroupSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    code: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    departmentId: z.coerce.number().int().positive().optional(),
  }),
});

export const createSubjectSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2),
    name: z.string().min(2),
    credits: z.coerce.number().int().positive(),
    departmentId: z.coerce.number().int().positive(),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    code: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    credits: z.coerce.number().int().positive().optional(),
    departmentId: z.coerce.number().int().positive().optional(),
  }),
});

export const createSectionSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2),
    subjectId: z.coerce.number().int().positive(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    semester: z.string().min(2),
    academicYear: z.string().min(4),
  }),
});

export const updateSectionSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    code: z.string().min(2).optional(),
    subjectId: z.coerce.number().int().positive().optional(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    semester: z.string().min(2).optional(),
    academicYear: z.string().min(4).optional(),
  }),
});

export const createScheduleSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    dayOfWeek: z.coerce.number().int().min(2).max(8),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    room: z.string().max(100).optional().nullable(),
  }),
});

export const updateScheduleSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    sectionId: z.coerce.number().int().positive().optional(),
    dayOfWeek: z.coerce.number().int().min(2).max(8).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    room: z.string().max(100).optional().nullable(),
  }),
});

export const createExamSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    examDate: z.coerce.date(),
    room: z.string().max(100).optional().nullable(),
    type: z.string().min(2),
  }),
});

export const updateExamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    sectionId: z.coerce.number().int().positive().optional(),
    examDate: z.coerce.date().optional(),
    room: z.string().max(100).optional().nullable(),
    type: z.string().min(2).optional(),
  }),
});

export const createEnrollmentSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    studentId: z.coerce.number().int().positive(),
    sectionId: z.coerce.number().int().positive(),
  }),
});
