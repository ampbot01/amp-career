import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@ampedmedia.id";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD belum diisi di .env");

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: await argon2.hash(password) },
    create: { email, passwordHash: await argon2.hash(password) },
  });

  await prisma.job.upsert({
    where: { slug: "senior-graphic-designer" },
    update: {},
    create: {
      slug: "senior-graphic-designer",
      title: "Senior Graphic Designer",
      category: "Design",
      location: "Yogyakarta (Hybrid)",
      type: "fulltime",
      description:
        "Kami mencari Senior Graphic Designer untuk memimpin visual project klien-klien AMP. Kamu akan bekerja dalam tim kreatif bespoke bersama strategist, copywriter, dan AI tooling internal kami.",
      requirements:
        "- Minimal 5 tahun pengalaman desain grafis\n- Portfolio kuat di brand identity & campaign visual\n- Mahir Adobe CC / Figma\n- Terbuka dengan AI-assisted workflow",
    },
  });

  await prisma.job.upsert({
    where: { slug: "copywriter" },
    update: {},
    create: {
      slug: "copywriter",
      title: "Copywriter",
      category: "Content",
      location: "Remote",
      type: "contract",
      isOpen: false,
      description: "Menulis copy untuk campaign digital klien AMP.",
      requirements: "- 2 tahun pengalaman\n- Bahasa Indonesia & Inggris aktif",
    },
  });

  console.log("Seed OK: admin +", await prisma.job.count(), "jobs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
