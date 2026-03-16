import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/emission-factor-sources?active=1&country=KR
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const active = params.get("active");
  const country = params.get("country");

  try {
    const pool = await getPool();
    const request = pool.request();
    const conditions: string[] = [];

    if (active !== null) {
      request.input("active", sql.Bit, active === "1" || active === "true" ? 1 : 0);
      conditions.push("active = @active");
    }
    if (country) {
      request.input("country", sql.NVarChar(10), country);
      conditions.push("country = @country");
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await request.query(
      `SELECT * FROM emission_factor_source ${where} ORDER BY year DESC, publisher`
    );
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error("[GET /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/emission-factor-sources
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = await getPool();
    const r = pool.request();

    r.input("source_code",    sql.NVarChar(50),   body.source_code);
    r.input("publisher",      sql.NVarChar(200),  body.publisher);
    r.input("document_name",  sql.NVarChar(500),  body.document_name);
    r.input("document_url",   sql.NVarChar(1000), body.document_url ?? null);
    r.input("country",        sql.NVarChar(10),   body.country ?? "KR");
    r.input("year",           sql.Int,            body.year);
    r.input("version",        sql.NVarChar(100),  body.version ?? null);
    r.input("notes",          sql.NVarChar(1000), body.notes ?? null);
    r.input("active",         sql.Bit,            body.active ?? 1);

    const result = await r.query(`
      INSERT INTO emission_factor_source
        (source_code, publisher, document_name, document_url, country, year, version, notes, active)
      OUTPUT INSERTED.id
      VALUES
        (@source_code, @publisher, @document_name, @document_url, @country, @year, @version, @notes, @active)
    `);
    return NextResponse.json({ ok: true, id: result.recordset[0]?.id });
  } catch (err: any) {
    console.error("[POST /api/emission-factor-sources]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
