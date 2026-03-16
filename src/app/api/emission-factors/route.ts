import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/emission-factors?scope=1&fuel_code=LNG&active=1
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const scope = params.get("scope");
  const fuelCode = params.get("fuel_code");
  const active = params.get("active");

  try {
    const pool = await getPool();
    const request = pool.request();

    const conditions: string[] = [];
    if (scope) {
      request.input("scope", sql.Int, parseInt(scope));
      conditions.push("scope = @scope");
    }
    if (fuelCode) {
      request.input("fuel_code", sql.NVarChar(100), fuelCode);
      conditions.push("fuel_code = @fuel_code");
    }
    if (active !== null && active !== undefined) {
      request.input("active", sql.Bit, active === "1" || active === "true" ? 1 : 0);
      conditions.push("active = @active");
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await request.query(
      `SELECT * FROM emission_factor_master ${where} ORDER BY scope, factor_code`
    );
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error("[GET /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/emission-factors — 새 계수 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = await getPool();
    const r = pool.request();

    r.input("factor_code",           sql.NVarChar(50),   body.factor_code);
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

    const result = await r.query(`
      INSERT INTO emission_factor_master
        (factor_code, scope, category_code, fuel_code, source_type, country, year,
         source_name, source_version, valid_from, valid_to, calculation_method,
         co2_factor, co2_factor_unit, ch4_factor, ch4_factor_unit,
         n2o_factor, n2o_factor_unit, ncv, ncv_unit, carbon_content_factor,
         oxidation_factor, gwp_ch4, gwp_n2o, source_id, active)
      OUTPUT INSERTED.id
      VALUES
        (@factor_code, @scope, @category_code, @fuel_code, @source_type, @country, @year,
         @source_name, @source_version, @valid_from, @valid_to, @calculation_method,
         @co2_factor, @co2_factor_unit, @ch4_factor, @ch4_factor_unit,
         @n2o_factor, @n2o_factor_unit, @ncv, @ncv_unit, @carbon_content_factor,
         @oxidation_factor, @gwp_ch4, @gwp_n2o, @source_id, @active)
    `);
    return NextResponse.json({ ok: true, id: result.recordset[0]?.id });
  } catch (err: any) {
    console.error("[POST /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
