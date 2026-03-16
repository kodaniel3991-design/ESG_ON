import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/activity?facilityId=xxx&year=2024
export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const year = req.nextUrl.searchParams.get("year") ?? "2024";
  if (!facilityId) {
    return NextResponse.json({ error: "facilityId is required" }, { status: 400 });
  }
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("facilityId", sql.NVarChar(50), facilityId);
    request.input("year", sql.Int, parseInt(year));
    const result = await request.query(`
      SELECT month, activity_value
      FROM activity_data
      WHERE facility_id = @facilityId AND year = @year
      ORDER BY month
    `);

    const values = Array(12).fill(0);
    for (const row of result.recordset) {
      values[row.month - 1] = Number(row.activity_value);
    }
    return NextResponse.json({ facilityId, year: parseInt(year), values });
  } catch (err: any) {
    console.error("[GET /api/activity]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/activity — 월별 활동량 일괄 저장 (upsert)
export async function POST(req: NextRequest) {
  try {
    const body: {
      facilityId: string;
      year: number;
      values: number[];
    } = await req.json();

    if (!body.facilityId || !body.year || !Array.isArray(body.values)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const pool = await getPool();

    for (let month = 1; month <= 12; month++) {
      const val = body.values[month - 1] ?? 0;
      const req2 = pool.request();
      req2.input("facilityId", sql.NVarChar(50), body.facilityId);
      req2.input("year", sql.Int, body.year);
      req2.input("month", sql.Int, month);
      req2.input("value", sql.Decimal(18, 6), val);
      await req2.query(`
        MERGE activity_data AS target
        USING (SELECT @facilityId AS facility_id, @year AS year, @month AS month) AS source
          ON target.facility_id = source.facility_id
         AND target.year = source.year
         AND target.month = source.month
        WHEN MATCHED THEN
          UPDATE SET activity_value = @value, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (facility_id, year, month, activity_value)
          VALUES (@facilityId, @year, @month, @value);
      `);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/activity]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
