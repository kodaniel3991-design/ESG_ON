import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/emission-factors?scope=1&fuel_code=LNG&active=1
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const scope = params.get("scope");
  const fuelCode = params.get("fuel_code");
  const active = params.get("active");

  try {
    const where: any = {};
    if (scope) where.scope = parseInt(scope);
    if (fuelCode) where.fuelCode = fuelCode;
    if (active !== null && active !== undefined) {
      where.active = active === "1" || active === "true";
    }

    const factors = await prisma.emissionFactorMaster.findMany({
      where,
      orderBy: [{ scope: "asc" }, { factorCode: "asc" }],
    });

    // Return with snake_case keys to match original response shape
    return NextResponse.json(
      factors.map((f) => ({
        id: f.id,
        factor_code: f.factorCode,
        scope: f.scope,
        category_code: f.categoryCode,
        fuel_code: f.fuelCode,
        source_type: f.sourceType,
        country: f.country,
        year: f.year,
        source_name: f.sourceName,
        source_version: f.sourceVersion,
        valid_from: f.validFrom,
        valid_to: f.validTo,
        calculation_method: f.calculationMethod,
        co2_factor: f.co2Factor,
        co2_factor_unit: f.co2FactorUnit,
        ch4_factor: f.ch4Factor,
        ch4_factor_unit: f.ch4FactorUnit,
        n2o_factor: f.n2oFactor,
        n2o_factor_unit: f.n2oFactorUnit,
        ncv: f.ncv,
        ncv_unit: f.ncvUnit,
        carbon_content_factor: f.carbonContentFactor,
        oxidation_factor: f.oxidationFactor,
        gwp_ch4: f.gwpCh4,
        gwp_n2o: f.gwpN2o,
        source_id: f.sourceId,
        active: f.active,
        created_at: f.createdAt,
        updated_at: f.updatedAt,
      }))
    );
  } catch (err: any) {
    console.error("[GET /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/emission-factors — 새 계수 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await prisma.emissionFactorMaster.create({
      data: {
        factorCode: body.factor_code,
        scope: body.scope,
        categoryCode: body.category_code ?? null,
        fuelCode: body.fuel_code ?? null,
        sourceType: body.source_type ?? null,
        country: body.country ?? "KR",
        year: body.year,
        sourceName: body.source_name,
        sourceVersion: body.source_version ?? null,
        validFrom: body.valid_from ? new Date(body.valid_from) : null,
        validTo: body.valid_to ? new Date(body.valid_to) : null,
        calculationMethod: body.calculation_method ?? null,
        co2Factor: body.co2_factor ?? null,
        co2FactorUnit: body.co2_factor_unit ?? null,
        ch4Factor: body.ch4_factor ?? null,
        ch4FactorUnit: body.ch4_factor_unit ?? null,
        n2oFactor: body.n2o_factor ?? null,
        n2oFactorUnit: body.n2o_factor_unit ?? null,
        ncv: body.ncv ?? null,
        ncvUnit: body.ncv_unit ?? null,
        carbonContentFactor: body.carbon_content_factor ?? null,
        oxidationFactor: body.oxidation_factor ?? 1.0,
        gwpCh4: body.gwp_ch4 ?? 21.0,
        gwpN2o: body.gwp_n2o ?? 310.0,
        sourceId: body.source_id ?? null,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: any) {
    console.error("[POST /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
