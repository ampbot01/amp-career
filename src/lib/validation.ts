import { z } from "zod";

export const applicationSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid").max(254),
  phone: z.string().min(8, "Nomor HP/WhatsApp minimal 8 digit").max(20),
  currentSalary: z.string().min(1, "Gaji saat ini wajib diisi").max(100),
  expectedSalary: z.string().min(1, "Ekspektasi gaji wajib diisi").max(100),
  portfolioUrl: z.union([z.literal(""), z.string().url("Format URL portfolio tidak valid")]).optional(),
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
