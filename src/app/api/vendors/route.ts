import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/vendors?type=list|submissions|esg-scores
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "list";

    if (type === "list") {
      const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(
        vendors.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          status: r.status,
          tier: r.tier,
          category: r.category,
          riskLevel: r.riskLevel,
          esgScore: r.esgScore != null ? parseFloat(String(r.esgScore)) : null,
          invitedAt: r.invitedAt,
          linkedAt: r.linkedAt,
        }))
      );
    }

    if (type === "submissions") {
      const submissions = await prisma.vendorSubmission.findMany({
        include: { vendor: true },
        orderBy: [{ vendor: { name: "asc" } }, { period: "asc" }],
      });
      return NextResponse.json(
        submissions.map((r) => ({
          id: r.id,
          vendorId: r.vendorId,
          vendorName: r.vendor.name,
          period: r.period,
          status: r.status,
          scope3CategoriesCompleted: r.scope3CategoriesCompleted,
          scope3CategoriesTotal: r.scope3CategoriesTotal,
          emissionsTco2e: r.emissionsTco2e != null ? parseFloat(String(r.emissionsTco2e)) : null,
          submittedAt: r.submittedAt,
        }))
      );
    }

    if (type === "esg-scores") {
      const scores = await prisma.vendorEsgScore.findMany({
        include: { vendor: true },
        orderBy: { vendor: { name: "asc" } },
      });
      return NextResponse.json(
        scores.map((r) => ({
          id: r.id,
          vendorId: r.vendorId,
          vendorName: r.vendor.name,
          overallScore: r.overallScore != null ? parseFloat(String(r.overallScore)) : null,
          environmentScore: r.environmentScore != null ? parseFloat(String(r.environmentScore)) : null,
          socialScore: r.socialScore != null ? parseFloat(String(r.socialScore)) : null,
          governanceScore: r.governanceScore != null ? parseFloat(String(r.governanceScore)) : null,
          riskLevel: r.riskLevel,
          trend: r.trend,
        }))
      );
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/vendors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/vendors — CRUD
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "save") {
      const { items } = body as { items: any[] };
      for (const item of items) {
        await prisma.vendor.upsert({
          where: { id: item.id },
          update: {
            name: item.name,
            email: item.email ?? null,
            status: item.status ?? "invited",
            tier: item.tier ?? null,
            category: item.category ?? null,
            riskLevel: item.riskLevel ?? null,
          },
          create: {
            id: item.id,
            name: item.name,
            email: item.email ?? null,
            status: item.status ?? "invited",
            tier: item.tier ?? null,
            category: item.category ?? null,
            riskLevel: item.riskLevel ?? null,
            invitedAt: new Date(),
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { id } = body;
      await prisma.vendor.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/vendors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
