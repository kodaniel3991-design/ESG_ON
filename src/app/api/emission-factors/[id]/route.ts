import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// PUT /api/emission-factors/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();
    const pool = await getPool();
    const r = pool.request();

    r.input("id",                     sql.Int,            id);
    r.input("factor_code",            sql.NVarChar(50),   body.factor_code);
    r.input("scope",                  sql.Int,            body.scope);
    r.input("category_code",          sql.NVarChar(50),   body.category_code ?? null);
    r.input("fuel_code",              sql.NVarChar(100),  body.fuel_code ?? null);
    r.input("source_type",            sql.NVarChar(50),   body.source_type ?? null);
    r.input("country",                sql.NVarChar(10),   body.country ?? "KR");
    r.input("year",                   sql.Int,            body.year);
    r.input("source_name",            sql.NVarChar(500),  body.source_name);
    r.input("source_version",         sql.NVarChar(100),  body.source_version ?? null);
    r.input("valid_from",             sql.Date,           body.valid_from ?? null);
    r.input("valid_to",               sql.Date,           body.valid_to ?? null);
    r.input("calculation_method",     sql.NVarChar(100),  body.calculation_method ?? null);
    r.input("co2_factor",             sql.Decimal(20,8),  body.co2_factor ?? null);
    r.input("co2_factor_unit",        sql.NVarChar(50),   body.co2_factor_unit ?? null);
    r.input("ch4_factor",             sql.Decimal(20,8),  body.ch4_factor ?? null);
    r.input("ch4_factor_unit",        sql.NVarChar(50),   body.ch4_factor_unit ?? null);
    r.input("n2o_factor",             sql.Decimal(20,8),  body.n2o_factor ?? null);
    r.input("n2o_factor_unit",        sql.NVarChar(50),   body.n2o_factor_unit ?? null);
    r.input("ncv",                    sql.Decimal(20,8),  body.ncv ?? null);
    r.input("ncv_unit",               sql.NVarChar(50),   body.ncv_unit ?? null);
    r.input("carbon_content_factor",  sql.Decimal(20,8),  body.carbon_content_factor ?? null);
    r.input("oxidation_factor",       sql.Decimal(10,6),  body.oxidation_factor ?? 1.0);
    r.input("gwp_ch4",                sql.Decimal(10,4),  body.gwp_ch4 ?? 21.0);
    r.input("gwp_n2o",                sql.Decimal(10,4),  body.gwp_n2o ?? 310.0);
    r.input("source_id",              sql.Int,            body.source_id ?? null);
    r.input("active",                 sql.Bit,            body.active ?? 1);

    await r.query(`
      UPDATE emission_factor_master SET
        factor_code           = @factor_code,
        scope                 = @scope,
        category_code         = @category_code,
        fuel_code             = @fuel_code,
        source_type           = @source_type,
        country               = @country,
        year                  = @year,
        source_name           = @source_name,
        source_version        = @source_version,
        valid_from            = @valid_from,
        valid_to              = @valid_to,
        calculation_method    = @calculation_method,
        co2_factor            = @co2_factor,
        co2_factor_unit       = @co2_factor_unit,
        ch4_factor            = @ch4_factor,
        ch4_factor_unit       = @ch4_factor_unit,
        n2o_factor            = @n2o_factor,
        n2o_factor_unit       = @n2o_factor_unit,
        ncv                   = @ncv,
        ncv_unit              = @ncv_unit,
        carbon_content_factor = @carbon_content_factor,
        oxidation_factor      = @oxidation_factor,
        gwp_ch4               = @gwp_ch4,
        gwp_n2o               = @gwp_n2o,
        source_id             = @source_id,
        active                = @active,
        updated_at            = GETDATE()
      WHERE id = @id
    `);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[PUT /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/emission-factors/:id  (soft delete)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const pool = await getPool();
    const r = pool.request();
    r.input("id", sql.Int, id);
    await r.query(`UPDATE emission_factor_master SET active = 0, updated_at = GETDATE() WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
