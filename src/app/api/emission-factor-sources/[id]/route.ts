import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/emission-factor-sources/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();

    await prisma.emissionFactorSource.update({
      where: { id },
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

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[PUT /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/emission-factor-sources/:id  (soft delete)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.emissionFactorSource.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
