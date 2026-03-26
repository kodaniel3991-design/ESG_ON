import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/facilities?scope=1&category=fixed
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  const category = req.nextUrl.searchParams.get("category");
  try {
    const where: any = {};
    if (scope) {
      where.scope = parseInt(scope);
      if (category) {
        where.categoryId = category;
      }
    }

    const facilities = await prisma.emissionFacility.findMany({
      where,
      orderBy: scope
        ? [{ sortOrder: "asc" }, { createdAt: "asc" }]
        : [{ scope: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Return with snake_case keys to match original response shape
    return NextResponse.json(
      facilities.map((f) => ({
        id: f.id,
        scope: f.scope,
        facility_name: f.facilityName,
        fuel_type: f.fuelType,
        energy_type: f.energyType,
        activity_type: f.activityType,
        unit: f.unit,
        data_method: f.dataMethod,
        category_id: f.categoryId,
        sort_order: f.sortOrder,
        created_at: f.createdAt,
        updated_at: f.updatedAt,
      }))
    );
  } catch (err: any) {
    console.error("[GET /api/facilities]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/facilities — 전체 목록을 통째로 저장 (upsert)
export async function POST(req: NextRequest) {
  try {
    const body: {
      scope: number;
      categoryId?: string;
      rows: Array<{
        id: string;
        facilityName: string;
        fuelType?: string;
        energyType?: string;
        activityType?: string;
        unit: string;
        dataMethod: string;
        sortOrder?: number;
        categoryId?: string;
      }>;
    } = await req.json();

    const categoryId = body.categoryId ?? "fixed";
    const newIds = body.rows.map((r) => r.id);

    // 새 목록에 없는 시설만 삭제 (CASCADE로 activity_data/attachments도 삭제)
    if (newIds.length > 0) {
      await prisma.emissionFacility.deleteMany({
        where: {
          scope: body.scope,
          categoryId,
          id: { notIn: newIds },
        },
      });
    } else {
      // 빈 목록 저장 시 전체 삭제
      await prisma.emissionFacility.deleteMany({
        where: { scope: body.scope, categoryId },
      });
    }

    // 각 시설을 upsert
    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      await prisma.emissionFacility.upsert({
        where: { id: row.id },
        update: {
          scope: body.scope,
          categoryId: row.categoryId ?? categoryId,
          facilityName: row.facilityName,
          fuelType: row.fuelType ?? null,
          energyType: row.energyType ?? null,
          activityType: row.activityType ?? null,
          unit: row.unit,
          dataMethod: row.dataMethod,
          sortOrder: row.sortOrder ?? i,
        },
        create: {
          id: row.id,
          scope: body.scope,
          categoryId: row.categoryId ?? categoryId,
          facilityName: row.facilityName,
          fuelType: row.fuelType ?? null,
          energyType: row.energyType ?? null,
          activityType: row.activityType ?? null,
          unit: row.unit,
          dataMethod: row.dataMethod,
          sortOrder: row.sortOrder ?? i,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/facilities]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
