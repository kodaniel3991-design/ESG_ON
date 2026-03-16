import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/facilities?scope=1&category=fixed
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  const category = req.nextUrl.searchParams.get("category");
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = "SELECT * FROM emission_facilities";
    if (scope) {
      request.input("scope", sql.Int, parseInt(scope));
      query += " WHERE scope = @scope";
      if (category) {
        request.input("category", sql.NVarChar(50), category);
        query += " AND category_id = @category";
      }
      query += " ORDER BY sort_order, created_at";
    } else {
      query += " ORDER BY scope, sort_order, created_at";
    }
    const result = await request.query(query);
    return NextResponse.json(result.recordset);
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

    const pool = await getPool();

    const del = pool.request();
    del.input("scope", sql.Int, body.scope);
    del.input("category_id", sql.NVarChar(50), body.categoryId ?? "fixed");
    await del.query("DELETE FROM emission_facilities WHERE scope = @scope AND category_id = @category_id");

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const ins = pool.request();
      ins.input("id", sql.NVarChar(50), row.id);
      ins.input("scope", sql.Int, body.scope);
      ins.input("category_id", sql.NVarChar(50), row.categoryId ?? body.categoryId ?? "fixed");
      ins.input("facility_name", sql.NVarChar(200), row.facilityName);
      ins.input("fuel_type", sql.NVarChar(100), row.fuelType ?? null);
      ins.input("energy_type", sql.NVarChar(100), row.energyType ?? null);
      ins.input("activity_type", sql.NVarChar(200), row.activityType ?? null);
      ins.input("unit", sql.NVarChar(50), row.unit);
      ins.input("data_method", sql.NVarChar(100), row.dataMethod);
      ins.input("sort_order", sql.Int, row.sortOrder ?? i);
      await ins.query(`
        INSERT INTO emission_facilities
          (id, scope, category_id, facility_name, fuel_type, energy_type, activity_type, unit, data_method, sort_order)
        VALUES
          (@id, @scope, @category_id, @facility_name, @fuel_type, @energy_type, @activity_type, @unit, @data_method, @sort_order)
      `);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/facilities]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
