/**
 * 로컬 관리자 계정 생성 스크립트
 * 실행: node scripts/seed-admin.js
 */
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "admin@esgon.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("✅ 관리자 계정이 이미 존재합니다.");
    console.log("   이메일:", email);
    console.log("   비밀번호: admin1234!");
  } else {
    const hashed = await bcrypt.hash("admin1234!", 10);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "관리자",
        email,
        password: hashed,
        status: "active",
      },
    });
    console.log("✅ 관리자 계정 생성 완료!");
    console.log("   이메일:", email);
    console.log("   비밀번호: admin1234!");
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ 오류:", e.message);
  process.exit(1);
});
