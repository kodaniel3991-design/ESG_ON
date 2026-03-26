/**
 * SQL Server → Supabase 데이터 마이그레이션 (수정본)
 * 실행: node scripts/migrate-to-supabase.js
 */
const sql = require("mssql");
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const mssqlConfig = {
  server: "DESKTOP-1H1D4PP\\MIRA_SQL",
  port: 1433,
  database: "envio",
  user: "envio_user",
  password: "Envio@2024!",
  options: { encrypt: true, trustServerCertificate: true },
};

async function migrate() {
  console.log("🔌 연결 중...");
  const mssqlPool = await sql.connect(mssqlConfig);
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pgPool);
  const prisma = new PrismaClient({ adapter });
  console.log("✅ 연결 완료\n");

  const q = (query) => mssqlPool.request().query(query);
  let ok = 0, fail = 0;

  async function run(label, fn) {
    try {
      const count = await fn();
      console.log(`  ✅ ${label}: ${count}건`);
      ok++;
    } catch (e) {
      console.log(`  ❌ ${label}: ${e.message.split("\n")[0]}`);
      fail++;
    }
  }

  console.log("📦 마이그레이션 시작...\n");

  // 1. organizations (auto-increment id)
  await run("organizations", async () => {
    const { recordset: rows } = await q("SELECT * FROM organizations");
    let count = 0;
    for (const r of rows) {
      // 이미 존재하면 업데이트, 없으면 생성
      const existing = await prisma.organization.findFirst();
      if (existing) {
        await prisma.organization.update({
          where: { id: existing.id },
          data: {
            organizationName: r.organization_name,
            address: r.address ?? "",
            addressDetail: r.address_detail ?? null,
          },
        });
      } else {
        await prisma.organization.create({
          data: {
            organizationName: r.organization_name,
            address: r.address ?? "",
            addressDetail: r.address_detail ?? null,
          },
        });
      }
      count++;
    }
    return count;
  });

  // org id 조회 (worksite에서 사용)
  const org = await prisma.organization.findFirst();
  const orgId = org?.id ?? 1;

  // 2. worksites
  await run("worksites", async () => {
    const { recordset: rows } = await q("SELECT * FROM worksites");
    for (const r of rows) {
      await prisma.worksite.upsert({
        where: { id: r.id },
        update: {
          name: r.name,
          address: r.address ?? "",
          addressDetail: r.address_detail ?? null,
          isDefault: r.is_default ?? false,
          sortOrder: r.sort_order ?? 0,
        },
        create: {
          id: r.id,
          organizationId: orgId,
          name: r.name,
          address: r.address ?? "",
          addressDetail: r.address_detail ?? null,
          isDefault: r.is_default ?? false,
          sortOrder: r.sort_order ?? 0,
        },
      });
    }
    return rows.length;
  });

  // 3. roles (이미 성공했지만 재실행)
  await run("roles", async () => {
    const { recordset: rows } = await q("SELECT * FROM roles");
    for (const r of rows) {
      await prisma.role.upsert({
        where: { id: r.id },
        update: { name: r.name, description: r.description, systemCode: r.system_code },
        create: {
          id: r.id,
          name: r.name,
          description: r.description ?? null,
          systemCode: r.system_code ?? null,
        },
      });
    }
    return rows.length;
  });

  // 4. users
  await run("users", async () => {
    const { recordset: rows } = await q("SELECT * FROM users");
    for (const r of rows) {
      await prisma.user.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          email: r.email,
          department: r.department ?? null,
          jobTitle: r.job_title ?? null,
          roleId: r.role_id ?? null,
          status: r.status ?? "active",
        },
      });
    }
    return rows.length;
  });

  // 5. emission_facilities
  await run("emission_facilities", async () => {
    const { recordset: rows } = await q("SELECT * FROM emission_facilities");
    for (const r of rows) {
      await prisma.emissionFacility.upsert({
        where: { id: r.id },
        update: {
          scope: r.scope,
          facilityName: r.facility_name,
          fuelType: r.fuel_type ?? null,
          energyType: r.energy_type ?? null,
          activityType: r.activity_type ?? null,
          unit: r.unit,
          dataMethod: r.data_method,
          categoryId: r.category_id ?? "fixed",
          sortOrder: r.sort_order ?? 0,
        },
        create: {
          id: r.id,
          scope: r.scope,
          facilityName: r.facility_name,
          fuelType: r.fuel_type ?? null,
          energyType: r.energy_type ?? null,
          activityType: r.activity_type ?? null,
          unit: r.unit,
          dataMethod: r.data_method,
          categoryId: r.category_id ?? "fixed",
          sortOrder: r.sort_order ?? 0,
        },
      });
    }
    return rows.length;
  });

  // 6. activity_data (unique: facilityId+year+month)
  await run("activity_data", async () => {
    const { recordset: rows } = await q("SELECT * FROM activity_data");
    let count = 0;
    for (const r of rows) {
      try {
        await prisma.activityData.upsert({
          where: { uq_activity_data: { facilityId: r.facility_id, year: r.year, month: r.month } },
          update: { activityValue: r.activity_value ?? 0 },
          create: {
            facilityId: r.facility_id,
            year: r.year,
            month: r.month,
            activityValue: r.activity_value ?? 0,
          },
        });
        count++;
      } catch (e) {
        // 개별 실패는 무시하고 계속
      }
    }
    return count;
  });

  // 7. activity_attachments (파일 데이터 포함)
  await run("activity_attachments", async () => {
    const { recordset: rows } = await q("SELECT * FROM activity_attachments");
    let count = 0;
    for (const r of rows) {
      const existing = await prisma.activityAttachment.findFirst({
        where: { facilityId: r.facility_id, year: r.year, month: r.month, fileName: r.file_name },
      });
      if (!existing) {
        await prisma.activityAttachment.create({
          data: {
            facilityId: r.facility_id,
            year: r.year,
            month: r.month,
            fileName: r.file_name,
            fileType: r.file_type ?? "application/octet-stream",
            fileSize: r.file_size ?? 0,
            fileData: r.file_data ?? Buffer.alloc(0),
          },
        });
        count++;
      }
    }
    return count;
  });

  // 8. kpi_masters
  await run("kpi_masters", async () => {
    const { recordset: rows } = await q("SELECT * FROM kpi_masters");
    for (const r of rows) {
      await prisma.kpiMaster.upsert({
        where: { id: r.id },
        update: { name: r.name, category: r.category, unit: r.unit, description: r.description },
        create: {
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category,
          unit: r.unit,
          description: r.description ?? null,
          reportIncluded: r.report_included ?? true,
        },
      });
    }
    return rows.length;
  });

  // 9. kpi_targets
  await run("kpi_targets", async () => {
    const { recordset: rows } = await q("SELECT * FROM kpi_targets");
    for (const r of rows) {
      await prisma.kpiTarget.upsert({
        where: { id: r.id },
        update: { targetValue: r.target_value ?? 0 },
        create: {
          id: r.id,
          kpiId: r.kpi_id,
          period: r.period,
          targetValue: r.target_value ?? 0,
          updatedBy: r.updated_by ?? null,
        },
      });
    }
    return rows.length;
  });

  // 10. kpi_performance
  await run("kpi_performance", async () => {
    const { recordset: rows } = await q("SELECT * FROM kpi_performance");
    for (const r of rows) {
      await prisma.kpiPerformance.upsert({
        where: { id: r.id },
        update: { actualValue: r.actual_value ?? 0 },
        create: {
          id: r.id,
          kpiId: r.kpi_id,
          period: r.period,
          actualValue: r.actual_value ?? 0,
          updatedBy: r.updated_by ?? null,
        },
      });
    }
    return rows.length;
  });

  // 11. kpi_disclosure_mappings
  await run("kpi_disclosure_mappings", async () => {
    const { recordset: rows } = await q("SELECT * FROM kpi_disclosure_mappings");
    for (const r of rows) {
      await prisma.kpiDisclosureMapping.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          kpiCode: r.kpi_code,
          kpiName: r.kpi_name,
          kpiCategory: r.kpi_category,
          framework: r.framework,
          disclosureCode: r.disclosure_code,
          status: r.status ?? "unlinked",
        },
      });
    }
    return rows.length;
  });

  // 12. esg_metrics
  await run("esg_metrics", async () => {
    const { recordset: rows } = await q("SELECT * FROM esg_metrics");
    for (const r of rows) {
      await prisma.esgMetric.upsert({
        where: { id: r.id },
        update: { value: r.value ?? null },
        create: {
          id: r.id,
          esgDomain: r.esg_domain,
          category: r.category,
          indicatorName: r.indicator_name,
          value: r.value ?? null,
          unit: r.unit ?? "",
          period: r.period,
          source: r.source ?? null,
          status: r.status ?? "pending",
        },
      });
    }
    return rows.length;
  });

  // 13. esg_reports
  await run("esg_reports", async () => {
    const { recordset: rows } = await q("SELECT * FROM esg_reports");
    for (const r of rows) {
      await prisma.esgReport.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          title: r.title,
          type: r.type,
          period: r.period,
          status: r.status ?? "draft",
          framework: r.framework ?? null,
          version: r.version ?? null,
          publishedAt: r.published_at ? new Date(r.published_at) : null,
        },
      });
    }
    return rows.length;
  });

  // 14. compliance_items
  await run("compliance_items", async () => {
    const { recordset: rows } = await q("SELECT * FROM compliance_items");
    for (const r of rows) {
      await prisma.complianceItem.upsert({
        where: { id: r.id },
        update: { status: r.status },
        create: {
          id: r.id,
          framework: r.framework,
          requirement: r.requirement,
          status: r.status ?? "non_compliant",
          dueDate: r.due_date ? new Date(r.due_date) : null,
          lastChecked: r.last_checked ? new Date(r.last_checked) : null,
        },
      });
    }
    return rows.length;
  });

  // 15. materiality_issues
  await run("materiality_issues", async () => {
    const { recordset: rows } = await q("SELECT * FROM materiality_issues");
    for (const r of rows) {
      await prisma.materialityIssue.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          code: r.code,
          name: r.name,
          dimension: r.dimension,
          description: r.description ?? null,
          expertScore: r.expert_score ?? 3.0,
          benchmarkScore: r.benchmark_score ?? 3.0,
          kpiLinkedCount: r.kpi_linked_count ?? 0,
          kpiConnectionStatus: r.kpi_connection_status ?? null,
          impactScore: r.impact_score ?? null,
          stakeholderScore: r.stakeholder_score ?? null,
        },
      });
    }
    return rows.length;
  });

  // 16. reduction_projects
  await run("reduction_projects", async () => {
    const { recordset: rows } = await q("SELECT * FROM reduction_projects");
    for (const r of rows) {
      await prisma.reductionProject.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          category: r.category,
          scope: r.scope,
          owner: r.owner ?? null,
          status: r.status ?? "planning",
          expectedReductionMt: r.expected_reduction_mt ?? null,
          actualReductionMt: r.actual_reduction_mt ?? null,
          estimatedCostM: r.estimated_cost_m ?? null,
          startDate: r.start_date ? new Date(r.start_date) : null,
          endDate: r.end_date ? new Date(r.end_date) : null,
        },
      });
    }
    return rows.length;
  });

  // 17. vendors
  await run("vendors", async () => {
    const { recordset: rows } = await q("SELECT * FROM vendors");
    for (const r of rows) {
      await prisma.vendor.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          email: r.email ?? null,
          status: r.status ?? "invited",
          tier: r.tier ?? null,
          category: r.category ?? null,
          riskLevel: r.risk_level ?? null,
          esgScore: r.esg_score ?? null,
          invitedAt: r.invited_at ? new Date(r.invited_at) : null,
          linkedAt: r.linked_at ? new Date(r.linked_at) : null,
        },
      });
    }
    return rows.length;
  });

  // 18. vendor_esg_scores
  await run("vendor_esg_scores", async () => {
    const { recordset: rows } = await q("SELECT * FROM vendor_esg_scores");
    for (const r of rows) {
      await prisma.vendorEsgScore.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          vendorId: r.vendor_id,
          overallScore: r.overall_score ?? null,
          environmentScore: r.environment_score ?? null,
          socialScore: r.social_score ?? null,
          governanceScore: r.governance_score ?? null,
          riskLevel: r.risk_level ?? null,
          trend: r.trend ?? null,
        },
      });
    }
    return rows.length;
  });

  console.log("\n" + "═".repeat(40));
  console.log(`✅ 성공: ${ok}개 테이블`);
  if (fail > 0) console.log(`❌ 실패: ${fail}개 테이블`);
  console.log("마이그레이션 완료!");

  await mssqlPool.close();
  await prisma.$disconnect();
  await pgPool.end();
}

migrate().catch((e) => {
  console.error("❌ 오류:", e.message);
  process.exit(1);
});
