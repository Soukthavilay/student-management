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
