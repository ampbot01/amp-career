import { describe, it, expect } from "vitest";
import { applicationSchema, jobSchema } from "./validation";

describe("applicationSchema", () => {
  const valid = {
    fullName: "Budi Santoso",
    email: "budi@example.com",
    phone: "08123456789",
    portfolioUrl: "https://behance.net/budi",
    coverLetter: "",
    source: "linkedin",
  };

  it("accepts valid input", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects bad email", () => {
    expect(applicationSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects missing phone", () => {
    const { phone, ...rest } = valid;
    expect(applicationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects too-short name", () => {
    expect(applicationSchema.safeParse({ ...valid, fullName: "B" }).success).toBe(false);
  });

  it("accepts empty portfolio/coverLetter/source (optional)", () => {
    expect(
      applicationSchema.safeParse({ fullName: "Ana", email: "a@b.co", phone: "08123456" }).success
    ).toBe(true);
  });

  it("rejects invalid portfolio URL when provided", () => {
    expect(applicationSchema.safeParse({ ...valid, portfolioUrl: "behance" }).success).toBe(false);
  });
});

describe("jobSchema", () => {
  const valid = {
    title: "Senior Graphic Designer",
    slug: "senior-graphic-designer",
    category: "Design",
    location: "Yogyakarta",
    type: "fulltime",
    description: "Kami mencari desainer grafis senior...",
    requirements: "Minimal 5 tahun pengalaman...",
  };

  it("accepts valid input", () => {
    expect(jobSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects title under 3 chars", () => {
    expect(jobSchema.safeParse({ ...valid, title: "AB" }).success).toBe(false);
  });

  it("rejects non-kebab slug", () => {
    expect(jobSchema.safeParse({ ...valid, slug: "Senior Designer!" }).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(jobSchema.safeParse({ ...valid, type: "remote" }).success).toBe(false);
  });

  it("accepts all valid types", () => {
    for (const type of ["fulltime", "contract", "freelance", "internship"]) {
      expect(jobSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
  });
});
