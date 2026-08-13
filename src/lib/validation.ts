import { z } from "zod";

export const applicationSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(8).max(20),
  portfolioUrl: z.union([z.literal(""), z.string().url()]).optional(),
  coverLetter: z.string().max(5000).optional(),
  source: z.string().max(100).optional(),
});

export const jobSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(60),
  location: z.string().min(2).max(100),
  type: z.enum(["fulltime", "contract", "freelance", "internship"]),
  description: z.string().min(10),
  requirements: z.string().min(10),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type JobInput = z.infer<typeof jobSchema>;
