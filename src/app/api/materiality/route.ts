import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/materiality?type=issues|matrix
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "issues";

    if (type === "issues") {
      const issues = await prisma.materialityIssue.findMany({ orderBy: { code: "asc" } });
      return NextResponse.json(
        issues.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          dimension: r.dimension,
          description: r.description,
          expertScore: parseFloat(String(r.expertScore)),
          benchmarkScore: parseFloat(String(r.benchmarkScore)),
          kpiLinkedCount: r.kpiLinkedCount,
          kpiConnectionStatus: r.kpiConnectionStatus,
          impactScore: r.impactScore != null ? parseFloat(String(r.impactScore)) : null,
          stakeholderScore: r.stakeholderScore != null ? parseFloat(String(r.stakeholderScore)) : null,
        }))
      );
    }

    if (type === "matrix") {
      const issues = await prisma.materialityIssue.findMany({
        where: {
          impactScore: { not: null },
          stakeholderScore: { not: null },
        },
      });
      return NextResponse.json(
        issues.map((r) => ({
          issueId: r.id,
          issueName: r.name,
          x: parseFloat(String(r.impactScore)),
          y: parseFloat(String(r.stakeholderScore)),
        }))
      );
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/materiality]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/materiality — save issues
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as { items: any[] };

    for (const item of items) {
      await prisma.materialityIssue.upsert({
        where: { id: item.id },
        update: {
          code: item.code,
          name: item.name,
          dimension: item.dimension,
          description: item.description ?? null,
          expertScore: item.expertScore,
          benchmarkScore: item.benchmarkScore,
          kpiLinkedCount: item.kpiLinkedCount ?? 0,
          impactScore: item.impactScore ?? null,
          stakeholderScore: item.stakeholderScore ?? null,
        },
        create: {
          id: item.id,
          code: item.code,
          name: item.name,
          dimension: item.dimension,
          description: item.description ?? null,
          expertScore: item.expertScore,
          benchmarkScore: item.benchmarkScore,
          kpiLinkedCount: item.kpiLinkedCount ?? 0,
          impactScore: item.impactScore ?? null,
          stakeholderScore: item.stakeholderScore ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/materiality]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
