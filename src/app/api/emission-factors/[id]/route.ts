import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/emission-factors/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();

    await prisma.emissionFactorMaster.update({
      where: { id },
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
    await prisma.emissionFactorMaster.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/emission-factors]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
