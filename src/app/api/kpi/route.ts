import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/kpi?type=master|targets|performance|change-log
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "master";

    if (type === "master") {
      const masters = await prisma.kpiMaster.findMany({ orderBy: { code: "asc" } });
      return NextResponse.json(
        masters.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category,
          unit: r.unit,
          description: r.description ?? "",
          reportIncluded: r.reportIncluded,
        }))
      );
    }

    if (type === "targets") {
      const period = req.nextUrl.searchParams.get("period");
      const targets = await prisma.kpiTarget.findMany({
        where: period ? { period } : undefined,
        include: { kpi: true },
        orderBy: { kpi: { code: "asc" } },
      });
      return NextResponse.json(
        targets.map((r) => ({
          id: r.id,
          kpiId: r.kpiId,
          kpiName: r.kpi.name,
          kpiCode: r.kpi.code,
          category: r.kpi.category,
          unit: r.kpi.unit,
          period: r.period,
          targetValue: parseFloat(String(r.targetValue)),
          updatedBy: r.updatedBy,
          updatedAt: r.updatedAt,
        }))
      );
    }

    if (type === "performance") {
      const period = req.nextUrl.searchParams.get("period");
      const performances = await prisma.kpiPerformance.findMany({
        where: period ? { period } : undefined,
        include: {
          kpi: {
            include: { targets: true },
          },
        },
        orderBy: { kpi: { code: "asc" } },
      });
      return NextResponse.json(
        performances.map((r) => {
          const actual = parseFloat(String(r.actualValue));
          // Find matching target for same period
          const matchingTarget = r.kpi.targets.find((t) => t.period === r.period);
          const target = matchingTarget ? parseFloat(String(matchingTarget.targetValue)) : null;
          return {
            id: r.id,
            kpiId: r.kpiId,
            kpiName: r.kpi.name,
            kpiCode: r.kpi.code,
            category: r.kpi.category,
            unit: r.kpi.unit,
            period: r.period,
            actualValue: actual,
            targetValue: target,
            achievementPercent: target ? Math.round((actual / target) * 100) : null,
            updatedBy: r.updatedBy,
            updatedAt: r.updatedAt,
          };
        })
      );
    }

    if (type === "change-log") {
      const logs = await prisma.kpiChangeLog.findMany({
        include: { kpi: true },
        orderBy: { changedAt: "desc" },
      });
      return NextResponse.json(
        logs.map((r) => ({
          id: r.id,
          kpiId: r.kpiId,
          kpiName: r.kpi.name,
          field: r.field,
          oldValue: r.oldValue,
          newValue: r.newValue,
          changedBy: r.changedBy,
          changedAt: r.changedAt,
        }))
      );
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/kpi]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/kpi — CRUD for KPI master, targets, performance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "save-master") {
      const { items } = body as { items: any[] };
      for (const item of items) {
        await prisma.kpiMaster.upsert({
          where: { id: item.id },
          update: {
            code: item.code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            description: item.description ?? null,
            reportIncluded: item.reportIncluded ? true : false,
          },
          create: {
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            description: item.description ?? null,
            reportIncluded: item.reportIncluded ? true : false,
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "save-targets") {
      const { items } = body as { items: any[] };
      for (const item of items) {
        await prisma.kpiTarget.upsert({
          where: { id: item.id },
          update: {
            targetValue: item.targetValue,
            updatedBy: item.updatedBy ?? null,
          },
          create: {
            id: item.id,
            kpiId: item.kpiId,
            period: item.period,
            targetValue: item.targetValue,
            updatedBy: item.updatedBy ?? null,
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "save-performance") {
      const { items } = body as { items: any[] };
      for (const item of items) {
        await prisma.kpiPerformance.upsert({
          where: { id: item.id },
          update: {
            actualValue: item.actualValue,
            updatedBy: item.updatedBy ?? null,
          },
          create: {
            id: item.id,
            kpiId: item.kpiId,
            period: item.period,
            actualValue: item.actualValue,
            updatedBy: item.updatedBy ?? null,
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-master") {
      const { id } = body;
      await prisma.kpiMaster.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/kpi]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
