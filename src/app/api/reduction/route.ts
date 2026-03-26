import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/reduction?type=projects|summary
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "projects";

    if (type === "projects") {
      const projects = await prisma.reductionProject.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        projects.map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          scope: r.scope,
          owner: r.owner,
          status: r.status,
          expectedReductionMt: r.expectedReductionMt != null ? parseFloat(String(r.expectedReductionMt)) : null,
          actualReductionMt: r.actualReductionMt != null ? parseFloat(String(r.actualReductionMt)) : null,
          estimatedCostM: r.estimatedCostM != null ? parseFloat(String(r.estimatedCostM)) : null,
          startDate: r.startDate,
          endDate: r.endDate,
        }))
      );
    }

    if (type === "summary") {
      const [total, completed, inProgress, aggResult] = await Promise.all([
        prisma.reductionProject.count(),
        prisma.reductionProject.count({ where: { status: "completed" } }),
        prisma.reductionProject.count({ where: { status: "in_progress" } }),
        prisma.reductionProject.aggregate({
          _sum: {
            expectedReductionMt: true,
            actualReductionMt: true,
          },
        }),
      ]);

      return NextResponse.json({
        totalProjects: total,
        completed,
        inProgress,
        totalExpectedReductionMt: parseFloat(String(aggResult._sum.expectedReductionMt ?? 0)) || 0,
        totalActualReductionMt: parseFloat(String(aggResult._sum.actualReductionMt ?? 0)) || 0,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/reduction]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/reduction — CRUD
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, item } = body;

    if (action === "save") {
      await prisma.reductionProject.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          category: item.category,
          scope: item.scope,
          owner: item.owner ?? null,
          status: item.status ?? "planning",
          expectedReductionMt: item.expectedReductionMt ?? null,
          actualReductionMt: item.actualReductionMt ?? null,
          estimatedCostM: item.estimatedCostM ?? null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
        },
        create: {
          id: item.id,
          name: item.name,
          category: item.category,
          scope: item.scope,
          owner: item.owner ?? null,
          status: item.status ?? "planning",
          expectedReductionMt: item.expectedReductionMt ?? null,
          actualReductionMt: item.actualReductionMt ?? null,
          estimatedCostM: item.estimatedCostM ?? null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { id } = body;
      await prisma.reductionProject.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/reduction]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
