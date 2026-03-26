/**
 * 조직구조 (부서/팀/직급/직무) 마이그레이션
 */
const sql = require("mssql");
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const mssqlConfig = {
  server: "DESKTOP-1H1D4PP\\MIRA_SQL", port: 1433, database: "envio",
  user: "envio_user", password: "Envio@2024!",
  options: { encrypt: true, trustServerCertificate: true },
};

async function main() {
  const mssqlPool = await sql.connect(mssqlConfig);
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pgPool) });
  const q = (query) => mssqlPool.request().query(query);

  console.log("📦 조직구조 마이그레이션 시작...\n");

  // 1. org_departments
  const { recordset: depts } = await q("SELECT * FROM org_departments ORDER BY sort_order, name");
  for (const r of depts) {
    await prisma.orgDepartment.upsert({
      where: { id: r.id },
      update: { name: r.name, sortOrder: r.sort_order ?? 0 },
      create: { id: r.id, name: r.name, sortOrder: r.sort_order ?? 0 },
    });
  }
  console.log(`  ✅ org_departments: ${depts.length}건`);

  // 2. org_teams
  const { recordset: teams } = await q("SELECT * FROM org_teams ORDER BY sort_order, name");
  for (const r of teams) {
    await prisma.orgTeam.upsert({
      where: { id: r.id },
      update: { name: r.name, departmentId: r.department_id ?? null, sortOrder: r.sort_order ?? 0 },
      create: {
        id: r.id,
        name: r.name,
        departmentId: r.department_id ?? null,
        leaderName: r.leader_name ?? null,
        defaultDutyName: r.default_duty_name ?? null,
        sortOrder: r.sort_order ?? 0,
      },
    });
  }
  console.log(`  ✅ org_teams: ${teams.length}건`);

  // 3. org_positions
  const { recordset: positions } = await q("SELECT * FROM org_positions ORDER BY sort_order, name");
  for (const r of positions) {
    await prisma.orgPosition.upsert({
      where: { id: r.id },
      update: { name: r.name, sortOrder: r.sort_order ?? 0 },
      create: { id: r.id, name: r.name, sortOrder: r.sort_order ?? 0 },
    });
  }
  console.log(`  ✅ org_positions: ${positions.length}건`);

  // 4. org_duties
  const { recordset: duties } = await q("SELECT * FROM org_duties ORDER BY sort_order, name");
  for (const r of duties) {
    await prisma.orgDuty.upsert({
      where: { id: r.id },
      update: { name: r.name, sortOrder: r.sort_order ?? 0 },
      create: { id: r.id, name: r.name, sortOrder: r.sort_order ?? 0 },
    });
  }
  console.log(`  ✅ org_duties: ${duties.length}건`);

  console.log("\n✅ 완료!");
  await mssqlPool.close();
  await prisma.$disconnect();
  await pgPool.end();
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
