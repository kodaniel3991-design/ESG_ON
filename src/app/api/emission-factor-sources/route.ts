import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/emission-factor-sources?active=1&country=KR
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const active = params.get("active");
  const country = params.get("country");

  try {
    const where: any = {};
    if (active !== null && active !== undefined) {
      where.active = active === "1" || active === "true";
    }
    if (country) {
      where.country = country;
    }

    const sources = await prisma.emissionFactorSource.findMany({
      where,
      orderBy: [{ year: "desc" }, { publisher: "asc" }],
    });

    // Return with snake_case keys to match original response shape
    return NextResponse.json(
      sources.map((s) => ({
        id: s.id,
        source_code: s.sourceCode,
        publisher: s.publisher,
        document_name: s.documentName,
        document_url: s.documentUrl,
        country: s.country,
        year: s.year,
        version: s.version,
        notes: s.notes,
        active: s.active,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      }))
    );
  } catch (err: any) {
    console.error("[GET /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/emission-factor-sources
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await prisma.emissionFactorSource.create({
      data: {
        sourceCode: body.source_code,
        publisher: body.publisher,
        documentName: body.document_name,
        documentUrl: body.document_url ?? null,
        country: body.country ?? "KR",
        year: body.year,
        version: body.version ?? null,
        notes: body.notes ?? null,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: any) {
    console.error("[POST /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
