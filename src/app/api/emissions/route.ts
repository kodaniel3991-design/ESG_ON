import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/emissions?type=summary|sources|trends
// 배출량 데이터는 activity_data + emission_factor_master 조인으로 실시간 계산
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "summary";
    const year = req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear());
    const yearInt = parseInt(year);

    if (type === "summary") {
      const rows = await prisma.$queryRaw<{ scope: number; total_emissions: number }[]>`
        SELECT ef.scope,
               SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total_emissions
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        LEFT JOIN LATERAL (
          SELECT co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
          LIMIT 1
        ) em ON true
        WHERE ad.year = ${yearInt}
        GROUP BY ef.scope
        ORDER BY ef.scope
      `;

      const scopeMap: Record<number, number> = {};
      for (const row of rows) {
        scopeMap[row.scope] = parseFloat(String(row.total_emissions)) || 0;
      }

      const scope1 = scopeMap[1] ?? 0;
      const scope2 = scopeMap[2] ?? 0;
      const scope3 = scopeMap[3] ?? 0;
      const total = scope1 + scope2 + scope3;

      // 전년도 비교
      const prevYear = yearInt - 1;
      const prevRows = await prisma.$queryRaw<{ prev_total: number }[]>`
        SELECT SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS prev_total
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        LEFT JOIN LATERAL (
          SELECT co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
          LIMIT 1
        ) em ON true
        WHERE ad.year = ${prevYear}
      `;
      const prevTotal = parseFloat(String(prevRows[0]?.prev_total)) || 0;
      const yoyChangePercent = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

      return NextResponse.json({
        totalMtCO2e: total,
        scope1,
        scope2,
        scope3,
        yoyChangePercent: Math.round(yoyChangePercent * 10) / 10,
      });
    }

    if (type === "sources") {
      const rows = await prisma.$queryRaw<{
        id: string;
        facility_name: string;
        scope: number;
        category_id: string;
        fuel_type: string | null;
        unit: string;
        total_activity: number;
        total_emissions: number;
      }[]>`
        SELECT
          ef.id, ef.facility_name, ef.scope, ef.category_id,
          ef.fuel_type, ef.unit,
          SUM(ad.activity_value) AS total_activity,
          SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total_emissions
        FROM emission_facilities ef
        LEFT JOIN activity_data ad ON ad.facility_id = ef.id AND ad.year = ${yearInt}
        LEFT JOIN LATERAL (
          SELECT co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
          LIMIT 1
        ) em ON true
        GROUP BY ef.id, ef.facility_name, ef.scope, ef.category_id, ef.fuel_type, ef.unit
        ORDER BY ef.scope, ef.facility_name
      `;

      return NextResponse.json(
        rows.map((r) => ({
          id: r.id,
          sourceName: r.facility_name,
          scope: `scope${r.scope}`,
          category: r.category_id,
          value: parseFloat(String(r.total_emissions)) || 0,
          unit: "tCO2e",
          period: year,
          status: "verified",
        }))
      );
    }

    if (type === "trends") {
      const rows = await prisma.$queryRaw<{ month: number; scope: number; emissions: number }[]>`
        SELECT ad.month, ef.scope,
               SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS emissions
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        LEFT JOIN LATERAL (
          SELECT co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
          LIMIT 1
        ) em ON true
        WHERE ad.year = ${yearInt}
        GROUP BY ad.month, ef.scope
        ORDER BY ad.month, ef.scope
      `;

      const monthMap: Record<number, { scope1: number; scope2: number; scope3: number }> = {};
      for (let m = 1; m <= 12; m++) {
        monthMap[m] = { scope1: 0, scope2: 0, scope3: 0 };
      }
      for (const row of rows) {
        const key = `scope${row.scope}` as "scope1" | "scope2" | "scope3";
        monthMap[row.month][key] = parseFloat(String(row.emissions)) || 0;
      }

      return NextResponse.json(
        Object.entries(monthMap).map(([month, data]) => ({
          month: parseInt(month),
          scope1: data.scope1,
          scope2: data.scope2,
          scope3: data.scope3,
          total: data.scope1 + data.scope2 + data.scope3,
        }))
      );
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/emissions]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
