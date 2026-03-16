import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// PUT /api/emission-factor-sources/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();
    const pool = await getPool();
    const r = pool.request();

    r.input("id",             sql.Int,            id);
    r.input("source_code",    sql.NVarChar(50),   body.source_code);
    r.input("publisher",      sql.NVarChar(200),  body.publisher);
    r.input("document_name",  sql.NVarChar(500),  body.document_name);
    r.input("document_url",   sql.NVarChar(1000), body.document_url ?? null);
    r.input("country",        sql.NVarChar(10),   body.country ?? "KR");
    r.input("year",           sql.Int,            body.year);
    r.input("version",        sql.NVarChar(100),  body.version ?? null);
    r.input("notes",          sql.NVarChar(1000), body.notes ?? null);
    r.input("active",         sql.Bit,            body.active ?? 1);

    await r.query(`
      UPDATE emission_factor_source SET
        source_code   = @source_code,
        publisher     = @publisher,
        document_name = @document_name,
        document_url  = @document_url,
        country       = @country,
        year          = @year,
        version       = @version,
        notes         = @notes,
        active        = @active,
        updated_at    = GETDATE()
      WHERE id = @id
    `);
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
    const pool = await getPool();
    const r = pool.request();
    r.input("id", sql.Int, id);
    await r.query(`UPDATE emission_factor_source SET active = 0, updated_at = GETDATE() WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
