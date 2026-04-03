import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthOrg, AuthError } from "@/lib/auth";

// GET /api/materiality?type=issues|matrix|generate
export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await getAuthOrg();
    const orgFilter = { organizationId };
    const type = req.nextUrl.searchParams.get("type") ?? "issues";

    if (type === "issues") {
      const issues = await prisma.materialityIssue.findMany({ where: orgFilter, orderBy: { code: "asc" } });
      return NextResponse.json(
        issues.map((r) => ({
          id: r.id, code: r.code, name: r.name, dimension: r.dimension,
          description: r.description, kpiGroup: r.kpiGroup,
          expertScore: parseFloat(String(r.expertScore)),
          benchmarkScore: parseFloat(String(r.benchmarkScore)),
          kpiLinkedCount: r.kpiLinkedCount,
          kpiConnectionStatus: r.kpiConnectionStatus,
          impactScale: r.impactScale != null ? parseFloat(String(r.impactScale)) : null,
          impactScope: r.impactScope != null ? parseFloat(String(r.impactScope)) : null,
          impactIrremediability: r.impactIrremediability != null ? parseFloat(String(r.impactIrremediability)) : null,
          impactScore: r.impactScore != null ? parseFloat(String(r.impactScore)) : null,
          financialScore: r.financialScore != null ? parseFloat(String(r.financialScore)) : null,
        }))
      );
    }

    if (type === "matrix") {
      const issues = await prisma.materialityIssue.findMany({
        where: { ...orgFilter, impactScore: { not: null }, financialScore: { not: null } },
      });
      return NextResponse.json(
        issues.map((r) => ({
          issueId: r.id, issueName: r.name, dimension: r.dimension,
          x: parseFloat(String(r.impactScore)),
          y: parseFloat(String(r.financialScore)),
        }))
      );
    }

    // KPI 카탈로그 그룹에서 이슈 자동 생성
    if (type === "generate") {
      const domainMap: Record<string, string> = { environmental: "environment", social: "social", governance: "governance" };
      const catalog = await prisma.kpiCatalog.findMany({
        where: { active: true },
        select: { esgDomain: true, grp: true },
        distinct: ["esgDomain", "grp"],
        orderBy: [{ esgDomain: "asc" }, { sortOrder: "asc" }],
      });

      let idx = 0;
      for (const item of catalog) {
        const dimension = domainMap[item.esgDomain] ?? "environment";
        const prefix = dimension === "environment" ? "ENV" : dimension === "social" ? "SOC" : "GOV";
        const code = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
        const id = `mat-${organizationId}-${code}`;

        await prisma.materialityIssue.upsert({
          where: { id },
          update: { name: item.grp, dimension, kpiGroup: item.grp },
          create: {
            id, organizationId, code, name: item.grp, dimension, kpiGroup: item.grp,
            expertScore: 3.0, benchmarkScore: 3.0,
          },
        });
        idx++;
      }

      // KPI 연결 수 업데이트
      const issues = await prisma.materialityIssue.findMany({
        where: { organizationId, kpiGroup: { not: null } },
      });
      for (const issue of issues) {
        const domain = issue.dimension === "environment" ? "environmental"
          : issue.dimension === "social" ? "social" : "governance";
        const count = await prisma.kpiCatalog.count({
          where: { esgDomain: domain, grp: issue.kpiGroup!, active: true },
        });
        await prisma.materialityIssue.update({
          where: { id: issue.id },
          data: { kpiLinkedCount: count, kpiConnectionStatus: count > 0 ? "full" : "none" },
        });
      }

      return NextResponse.json({ ok: true, count: idx });
    }

    if (type === "settings") {
      const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { materialitySettings: true } });
      const defaults = { threshold: 3.5, period: "annual", year: new Date().getFullYear(), assessmentName: "" };
      const saved = org?.materialitySettings ? JSON.parse(org.materialitySettings) : {};
      return NextResponse.json({ ...defaults, ...saved });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/materiality]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/materiality — save issues / settings
export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await getAuthOrg();
    const body = await req.json();
    const { action } = body;

    // 설정 저장
    if (action === "save-settings") {
      const { settings } = body;
      await prisma.organization.update({
        where: { id: organizationId },
        data: { materialitySettings: JSON.stringify(settings) },
      });
      return NextResponse.json({ ok: true });
    }

    // 이슈 삭제
    if (action === "delete-issue") {
      const issue = await prisma.materialityIssue.findUnique({ where: { id: body.id }, select: { organizationId: true } });
      if (!issue || issue.organizationId !== organizationId) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
      await prisma.materialityIssue.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    // 이슈 점수 저장 (기존)
    const { items } = body as { items: any[] };
    for (const item of items) {
      const scale = item.impactScale ?? null;
      const scope = item.impactScope ?? null;
      const irremediability = item.impactIrremediability ?? null;
      let impactScore = item.impactScore ?? null;
      if (scale != null && scope != null && irremediability != null) {
        impactScore = Math.round(((scale + scope + irremediability) / 3) * 100) / 100;
      }

      const data = {
        code: item.code, name: item.name, dimension: item.dimension,
        description: item.description ?? null,
        kpiGroup: item.kpiGroup ?? null,
        expertScore: item.expertScore ?? 3.0, benchmarkScore: item.benchmarkScore ?? 3.0,
        kpiLinkedCount: item.kpiLinkedCount ?? 0,
        impactScale: scale, impactScope: scope, impactIrremediability: irremediability,
        impactScore, financialScore: item.financialScore ?? null,
      };

      await prisma.materialityIssue.upsert({
        where: { id: item.id },
        update: data,
        create: { id: item.id, organizationId, ...data },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/materiality]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
