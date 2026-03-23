import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// 공통: 스코프별 배출량 집계 헬퍼 (JOIN 방식, SQL Server 호환)
async function calcScopeEmissions(pool: any, year: number) {
  const r = pool.request();
  r.input("year", sql.Int, year);
  const result = await r.query(`
    SELECT ef.scope, ad.month,
           SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total
    FROM activity_data ad
    JOIN emission_facilities ef ON ad.facility_id = ef.id
    OUTER APPLY (
      SELECT TOP 1 co2_factor FROM emission_factor_master
      WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
    ) em
    WHERE ad.year = @year
    GROUP BY ef.scope, ad.month;
  `);
  return result.recordset;
}

// GET /api/dashboard?type=summary|scope-breakdown|trends|kpis|trend-data|scope-donut|offset-summary|top-vendors|insights|notifications
// 대시보드는 여러 테이블 조합 → 실시간 집계
export async function GET(req: NextRequest) {
  try {
    const pool = await getPool();
    const type = req.nextUrl.searchParams.get("type") ?? "summary";
    const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));

    if (type === "summary") {
      // 배출량 KPI 카드
      const r = pool.request();
      r.input("year", sql.Int, year);
      r.input("prev_year", sql.Int, year - 1);

      const emResult = await r.query(`
        SELECT ef.scope,
               SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        OUTER APPLY (
          SELECT TOP 1 co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
        ) em
        WHERE ad.year = @year
        GROUP BY ef.scope;
      `);

      const scopeMap: Record<number, number> = {};
      for (const row of emResult.recordset) {
        scopeMap[row.scope] = parseFloat(row.total) || 0;
      }

      // KPI 달성률
      const kpiResult = await pool.request().query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN p.actual_value IS NOT NULL THEN 1 ELSE 0 END) AS entered
        FROM kpi_masters m
        LEFT JOIN kpi_performance p ON p.kpi_id = m.id;
      `);

      // ESG 데이터 입력율
      const esgResult = await pool.request().query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN value IS NOT NULL THEN 1 ELSE 0 END) AS filled
        FROM esg_metrics;
      `);

      // 협력사 현황
      const vendorResult = await pool.request().query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count
        FROM vendors;
      `);

      const scope1 = scopeMap[1] ?? 0;
      const scope2 = scopeMap[2] ?? 0;
      const scope3 = scopeMap[3] ?? 0;

      return NextResponse.json({
        emissions: {
          totalMtCO2e: scope1 + scope2 + scope3,
          scope1,
          scope2,
          scope3,
        },
        kpi: {
          total: kpiResult.recordset[0]?.total ?? 0,
          entered: kpiResult.recordset[0]?.entered ?? 0,
        },
        esg: {
          total: esgResult.recordset[0]?.total ?? 0,
          filled: esgResult.recordset[0]?.filled ?? 0,
        },
        vendors: {
          total: vendorResult.recordset[0]?.total ?? 0,
          active: vendorResult.recordset[0]?.active_count ?? 0,
        },
      });
    }

    if (type === "scope-breakdown") {
      const r = pool.request();
      r.input("year", sql.Int, year);
      const result = await r.query(`
        SELECT ef.scope,
               SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        OUTER APPLY (
          SELECT TOP 1 co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
        ) em
        WHERE ad.year = @year
        GROUP BY ef.scope;
      `);
      return NextResponse.json(
        result.recordset.map((r: any) => ({
          scope: `Scope ${r.scope}`,
          value: parseFloat(r.total) || 0,
        }))
      );
    }

    if (type === "trends") {
      const r = pool.request();
      r.input("year", sql.Int, year);
      const result = await r.query(`
        SELECT ad.month,
               SUM(ad.activity_value * COALESCE(em.co2_factor, 0)) AS total
        FROM activity_data ad
        JOIN emission_facilities ef ON ad.facility_id = ef.id
        OUTER APPLY (
          SELECT TOP 1 co2_factor FROM emission_factor_master
          WHERE fuel_code = COALESCE(ef.fuel_type, ef.energy_type)
        ) em
        WHERE ad.year = @year
        GROUP BY ad.month
        ORDER BY ad.month;
      `);

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: 0,
      }));
      for (const row of result.recordset) {
        months[row.month - 1].value = parseFloat(row.total) || 0;
      }
      return NextResponse.json(months);
    }

    // ── kpis: 대시보드 KPI 카드 ──
    if (type === "kpis") {
      const result = await pool.request().query(`
        SELECT m.id, m.code, m.name, m.category, m.unit,
               t.target_value, p.actual_value
        FROM kpi_masters m
        LEFT JOIN kpi_targets t ON t.kpi_id = m.id
        LEFT JOIN kpi_performance p ON p.kpi_id = m.id
        WHERE m.report_included = 1
        ORDER BY m.code;
      `);

      const kpis = result.recordset.map((r: any) => {
        const target = parseFloat(r.target_value) || 0;
        const actual = parseFloat(r.actual_value) || 0;
        const ratio = target > 0 ? actual / target : 0;
        // 퍼센트 지표: actual ≤ target 이 좋음, 배출량 지표: actual ≤ target 이 좋음
        const isLowerBetter = ["tCO2e", "tCO2e/억원", "%", "건"].includes(r.unit) && r.category !== "social";
        const onTrack = isLowerBetter ? actual <= target : actual >= target;
        const status = onTrack ? "on_track" : ratio > 0.9 ? "attention" : "anomaly";
        const trendDir = actual <= target ? "down" : "up";

        return {
          id: String(r.id),
          label: r.name,
          value: `${actual.toLocaleString()} ${r.unit}`,
          subLabel: `목표: ${target.toLocaleString()} ${r.unit}`,
          status,
          trendDirection: trendDir,
        };
      });
      return NextResponse.json(kpis);
    }

    // ── trend-data: 월별 스코프별 트렌드 ──
    if (type === "trend-data") {
      const rows = await calcScopeEmissions(pool, year);
      const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
      const months: Record<number, any> = {};
      for (let m = 1; m <= 12; m++) {
        months[m] = { name: monthNames[m - 1], scope1: 0, scope2: 0, scope3: 0 };
      }
      for (const r of rows) {
        const key = `scope${r.scope}`;
        if (months[r.month]) months[r.month][key] = parseFloat(r.total) || 0;
      }
      return NextResponse.json(Object.values(months));
    }

    // ── scope-donut: 도넛 차트 데이터 ──
    if (type === "scope-donut") {
      const rows = await calcScopeEmissions(pool, year);
      const scopeTotals: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      for (const r of rows) {
        scopeTotals[r.scope] = (scopeTotals[r.scope] || 0) + (parseFloat(r.total) || 0);
      }
      const total = scopeTotals[1] + scopeTotals[2] + scopeTotals[3];
      const colors = { 1: "hsl(142, 76%, 36%)", 2: "hsl(221, 83%, 53%)", 3: "hsl(25, 95%, 53%)" };
      return NextResponse.json([
        { name: "Scope 1", value: total > 0 ? Math.round(scopeTotals[1] / total * 100) : 0, tCO2e: Math.round(scopeTotals[1] * 100) / 100, fill: colors[1] },
        { name: "Scope 2", value: total > 0 ? Math.round(scopeTotals[2] / total * 100) : 0, tCO2e: Math.round(scopeTotals[2] * 100) / 100, fill: colors[2] },
        { name: "Scope 3", value: total > 0 ? Math.round(scopeTotals[3] / total * 100) : 0, tCO2e: Math.round(scopeTotals[3] * 100) / 100, fill: colors[3] },
      ]);
    }

    // ── offset-summary: 탄소 상쇄 요약 ──
    if (type === "offset-summary") {
      const rows = await calcScopeEmissions(pool, year);
      let totalEmissions = 0;
      for (const r of rows) totalEmissions += parseFloat(r.total) || 0;

      const redResult = await pool.request().query(`
        SELECT COALESCE(SUM(actual_reduction_mt), 0) AS offset_total
        FROM reduction_projects WHERE status IN ('in_progress', 'completed');
      `);
      const offsetT = parseFloat(redResult.recordset[0]?.offset_total) || 0;

      return NextResponse.json({
        totalEmissionsT: Math.round(totalEmissions * 100) / 100,
        offsetT: Math.round(offsetT * 100) / 100,
      });
    }

    // ── top-vendors: 상위 협력사 배출량 ──
    if (type === "top-vendors") {
      const result = await pool.request().query(`
        SELECT TOP 5 v.id, v.name AS vendorName, v.category,
               COALESCE(vs.emissions_tco2e, 0) AS emissionsKg,
               COALESCE(ves.trend, 'stable') AS trendDirection
        FROM vendors v
        LEFT JOIN vendor_submissions vs ON vs.vendor_id = v.id
        LEFT JOIN vendor_esg_scores ves ON ves.vendor_id = v.id
        WHERE v.status = 'active'
        ORDER BY v.esg_score DESC;
      `);

      return NextResponse.json(
        result.recordset.map((r: any) => ({
          id: String(r.id),
          vendorName: r.vendorName,
          scope: "scope3" as const,
          emissionsKg: parseFloat(r.emissionsKg) || 0,
          trendDirection: r.trendDirection === "up" ? "up" : "down",
        }))
      );
    }

    // ── insights: AI 인사이트 ──
    if (type === "insights") {
      // 실시간 DB 기반 인사이트 생성
      const insights: any[] = [];

      // 배출량 vs 전년
      const rows = await calcScopeEmissions(pool, year);
      let totalNow = 0;
      for (const r of rows) totalNow += parseFloat(r.total) || 0;

      if (totalNow > 0) {
        insights.push({
          id: "ins-emission",
          type: "emission",
          title: `${year}년 총 배출량 ${Math.round(totalNow).toLocaleString()} tCO2e`,
          detail: "Scope 1+2+3 합산 기준입니다. 감축 프로젝트 성과를 확인하세요.",
          actionLabel: "배출 현황 보기",
          actionHref: "/emissions",
        });
      }

      // KPI 미달 항목
      const kpiAlert = await pool.request().query(`
        SELECT TOP 3 m.name, t.target_value, p.actual_value
        FROM kpi_masters m
        JOIN kpi_targets t ON t.kpi_id = m.id
        JOIN kpi_performance p ON p.kpi_id = m.id
        WHERE p.actual_value > t.target_value
          AND m.category IN ('carbon', 'environment');
      `);
      for (const k of kpiAlert.recordset) {
        insights.push({
          id: `ins-kpi-${k.name}`,
          type: "kpi",
          title: `${k.name} 목표 미달`,
          detail: `목표 ${k.target_value} 대비 실적 ${k.actual_value} (초과)`,
          actionLabel: "KPI 상세 보기",
          actionHref: "/kpi",
        });
      }

      // 감축 프로젝트
      const redResult = await pool.request().query(`
        SELECT name, expected_reduction_mt, actual_reduction_mt
        FROM reduction_projects WHERE status = 'in_progress';
      `);
      if (redResult.recordset.length > 0) {
        const totalExp = redResult.recordset.reduce((s: number, r: any) => s + (parseFloat(r.expected_reduction_mt) || 0), 0);
        const totalAct = redResult.recordset.reduce((s: number, r: any) => s + (parseFloat(r.actual_reduction_mt) || 0), 0);
        insights.push({
          id: "ins-reduction",
          type: "reduction",
          title: `감축 프로젝트 진행률 ${Math.round(totalAct / totalExp * 100)}%`,
          detail: `${redResult.recordset.length}개 진행 중, 목표 ${totalExp}t 중 ${totalAct}t 달성`,
          actionLabel: "감축 프로젝트 보기",
          actionHref: "/reduction",
        });
      }

      return NextResponse.json(insights);
    }

    // ── notifications: 알림 ──
    if (type === "notifications") {
      const notifications: any[] = [];

      // 마감 임박 컴플라이언스
      const compResult = await pool.request().query(`
        SELECT TOP 3 framework, requirement, due_date, status
        FROM compliance_items
        WHERE status NOT IN ('compliant')
        ORDER BY due_date ASC;
      `);
      for (const c of compResult.recordset) {
        notifications.push({
          id: `notif-comp-${c.framework}`,
          type: "report",
          title: `${c.framework} - ${c.requirement}`,
          body: `마감일: ${new Date(c.due_date).toLocaleDateString("ko-KR")}`,
          actionLabel: "확인하기",
          actionHref: "/compliance",
        });
      }

      // ESG 미검증 항목
      const esgPending = await pool.request().query(`
        SELECT COUNT(*) AS cnt FROM esg_metrics WHERE status IN ('pending', 'estimated');
      `);
      const pendingCnt = esgPending.recordset[0]?.cnt ?? 0;
      if (pendingCnt > 0) {
        notifications.push({
          id: "notif-esg-pending",
          type: "data",
          title: `ESG 데이터 검증 필요`,
          body: `${pendingCnt}개 지표가 검증 대기 중입니다.`,
          actionLabel: "데이터 검증",
          actionHref: "/data-management/validation",
        });
      }

      // 초대 대기 협력사
      const vendorPending = await pool.request().query(`
        SELECT COUNT(*) AS cnt FROM vendors WHERE status IN ('invited', 'pending');
      `);
      const vpCnt = vendorPending.recordset[0]?.cnt ?? 0;
      if (vpCnt > 0) {
        notifications.push({
          id: "notif-vendor-pending",
          type: "system",
          title: `협력사 응답 대기`,
          body: `${vpCnt}개 협력사가 초대에 미응답 상태입니다.`,
          actionLabel: "협력사 관리",
          actionHref: "/supply-chain",
        });
      }

      return NextResponse.json(notifications);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
