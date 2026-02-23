import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(16),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});
