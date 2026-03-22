import { z } from "zod";

const componentSchema = z.object({
  name: z.string().min(2),
  weight: z.coerce.number().positive().max(1),
  score: z.coerce.number().min(0).max(10),
});

export const sectionParamsSchema = z.object({
  params: z.object({
    sectionId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
});

export const upsertGradeSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    enrollmentId: z.coerce.number().int().positive(),
    components: z.array(componentSchema).min(1),
    finalScore: z.coerce.number().min(0).max(10),
  }),
});

export const submitGradeSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    enrollmentId: z.coerce.number().int().positive(),
  }),
});

export const createLecturerAnnouncementSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
    content: z.string().min(2, "Nội dung phải có ít nhất 2 ký tự"),
    scope: z.enum(["CLASS", "SECTION"]),
    classGroupId: z.coerce.number().int().positive().optional().nullable(),
    sectionId: z.coerce.number().int().positive().optional().nullable(),
  }),
});

export const markAttendanceSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
    date: z.coerce.date(),
    attendanceData: z.array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
        remark: z.string().optional().nullable(),
      })
    ).min(1),
  }),
});

export const overrideExamEligibilitySchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    studentId: z.coerce.number().int().positive(),
    sectionId: z.coerce.number().int().positive(),
    isEligible: z.boolean(),
  }),
});
