import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: "asc" },
      include: {
        submissions: { orderBy: { createdAt: "desc" }, take: 1 },
        esgScores: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(
      vendors.map((v) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        status: v.status,
        tier: v.tier,
        category: v.category,
        riskLevel: v.riskLevel,
        esgScore: v.esgScore != null ? parseFloat(String(v.esgScore)) : null,
        invitedAt: v.invitedAt,
        linkedAt: v.linkedAt,
        latestSubmission: v.submissions[0] ?? null,
        latestEsgScore: v.esgScores[0] ?? null,
      }))
    );
  } catch (e: any) {
    console.error("[api/supply-chain/vendors]", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
