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
    status: z.enum(["ACTIVE", "DROPOUT", "SUSPENDED", "GRADUATED", "RESERVED"]).optional(),
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
    status: z.enum(["ACTIVE", "DROPOUT", "SUSPENDED", "GRADUATED", "RESERVED"]).optional(),
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
    scope: z.enum(["ALL", "DEPARTMENT", "CLASS", "SECTION", "SEMESTER"]),
    departmentId: z.coerce.number().int().positive().optional().nullable(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    sectionId: z.coerce.number().int().positive().optional().nullable(),
    semesterId: z.coerce.number().int().positive().optional().nullable(),
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

// ── Semester Scschemas ──
export const createSemesterSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    name: z.string().min(2),
    academicYear: z.string().min(4),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(["UPCOMING", "ENROLLMENT", "ONGOING", "GRADING", "COMPLETED", "HIDDEN"]).default("UPCOMING"),
  }),
});

export const updateSemesterSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    name: z.string().min(2).optional(),
    academicYear: z.string().min(4).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(["UPCOMING", "ENROLLMENT", "ONGOING", "GRADING", "COMPLETED", "HIDDEN"]).optional(),
  }),
});

// ── Room Schemas ──
export const createRoomSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    name: z.string().min(1),
    capacity: z.coerce.number().int().positive(),
    type: z.enum(["LECTURE_HALL", "CLASSROOM", "LABORATORY", "COMPUTER_ROOM", "OFFICE"]).default("CLASSROOM"),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({
    name: z.string().min(1).optional(),
    capacity: z.coerce.number().int().positive().optional(),
    type: z.enum(["LECTURE_HALL", "CLASSROOM", "LABORATORY", "COMPUTER_ROOM", "OFFICE"]).optional(),
  }),
});

export const createSubjectSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2),
    name: z.string().min(2),
    credits: z.coerce.number().int().positive(),
    departmentId: z.coerce.number().int().positive(),
    type: z.enum(["GENERAL", "SPECIALIZED"]).default("SPECIALIZED"),
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
    type: z.enum(["GENERAL", "SPECIALIZED"]).optional(),
  }),
});

export const createSectionSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    code: z.string().min(2),
    subjectId: z.coerce.number().int().positive(),
    semesterId: z.coerce.number().int().positive(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    capacity: z.coerce.number().int().positive().optional(),
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
    semesterId: z.coerce.number().int().positive().optional(),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    capacity: z.coerce.number().int().positive().optional(),
  }),
});

export const createScheduleSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    dayOfWeek: z.coerce.number().int().min(2).max(8),
    shift: z.coerce.number().int().min(1).max(20).optional().nullable(),
    roomId: z.coerce.number().int().positive().optional().nullable(),
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
    shift: z.coerce.number().int().min(1).max(20).optional().nullable(),
    roomId: z.coerce.number().int().positive().optional().nullable(),
  }),
});

export const createExamSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    examDate: z.coerce.date(),
    roomId: z.coerce.number().int().positive().optional().nullable(),
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
    roomId: z.coerce.number().int().positive().optional().nullable(),
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

export const upsertCurriculumSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    departmentId: z.coerce.number().int().positive(),
    name: z.string().min(2, "Tên CTĐT phải có ít nhất 2 ký tự"),
    totalSemesters: z.coerce.number().int().min(1).max(12).default(8),
  }),
});

export const addCurriculumSubjectSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    curriculumId: z.coerce.number().int().positive(),
    subjectId: z.coerce.number().int().positive(),
    semester: z.coerce.number().int().min(1).max(12),
  }),
});

export const enrollBySemesterSchema = z.object({
  ...baseEnvelope,
  body: z.object({
    studentId: z.coerce.number().int().positive(),
    curriculumSemester: z.coerce.number().int().min(1).max(12),
    semesterId: z.coerce.number().int().positive(),
  }),
});
