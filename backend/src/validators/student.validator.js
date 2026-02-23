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
