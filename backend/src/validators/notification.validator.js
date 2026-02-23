import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    token: z.string().min(20),
    platform: z.enum(["IOS", "ANDROID"]),
  }),
});
