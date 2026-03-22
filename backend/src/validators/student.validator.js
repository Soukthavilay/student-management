import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(8).max(20).optional().nullable(),
    address: z.string().min(3).max(255).optional().nullable(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});
export const availableSectionsQuerySchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({
    subjectId: z.coerce.number().int().positive().optional(),
    departmentId: z.coerce.number().int().positive().optional(),
  }),
  body: z.object({}).passthrough(),
});

export const registerSectionSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    sectionId: z.coerce.number().int().positive(),
  }),
});

export const dropSectionSchema = z.object({
  params: z.object({
    sectionId: z.coerce.number().int().positive(),
  }),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
});
