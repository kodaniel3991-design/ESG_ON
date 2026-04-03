/**
 * 기존 KpiMaster의 managementLevel을 카탈로그 priority 기반으로 업데이트
 * 실행: npx tsx prisma/seed-kpi-management-level.ts
 */
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const connStr = process.env.DATABASE_URL || "";
const sep = connStr.includes("?") ? "&" : "?";
const pool = new pg.Pool({ connectionString: `${connStr}${sep}client_encoding=UTF8` });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 카탈로그에서 critical KPI 이름 목록 조회
  const criticalKpis = await prisma.kpiCatalog.findMany({
    where: { priority: "critical", active: true },
    select: { name: true },
  });
  const criticalNames = new Set(criticalKpis.map((k) => k.name));
  console.log(`카탈로그 critical KPI: ${criticalNames.size}개`);

  // 모든 KpiMaster 업데이트
  const masters = await prisma.kpiMaster.findMany({ select: { id: true, name: true, managementLevel: true } });
  let updated = 0;

  for (const m of masters) {
    const newLevel = criticalNames.has(m.name) ? "critical" : "general";
    if (m.managementLevel !== newLevel) {
      await prisma.kpiMaster.update({
        where: { id: m.id },
        data: { managementLevel: newLevel },
      });
      updated++;
      console.log(`  ${m.name}: ${m.managementLevel} → ${newLevel}`);
    }
  }

  console.log(`\n총 ${masters.length}개 중 ${updated}개 업데이트 완료`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
