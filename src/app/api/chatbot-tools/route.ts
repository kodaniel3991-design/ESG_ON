import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 챗봇 Tool API — chat-bot-demo에서 호출하는 엔드포인트
 * GET: 데이터 조회 (facilities, activity, kpi, employees, esg, dashboard, emission-factors)
 * POST: 데이터 변경 (save-activity, create/update/delete-emission-record)
 */

// 미들웨어에서 인증 없이 접근 가능하도록 /api/chatbot-tools를 PUBLIC_PATHS에 추가 필요

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get("tool");

    switch (tool) {
      case "facilities": {
        const scope = Number(searchParams.get("scope") || "1");
        const categoryId = searchParams.get("categoryId");
        const where: Record<string, unknown> = { scope };
        if (categoryId) where.categoryId = categoryId;
        const facilities = await prisma.emissionFacility.findMany({
          where,
          select: {
            id: true, facilityName: true, fuelType: true, energyType: true,
            unit: true, categoryId: true, status: true, worksiteId: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 50,
        });
        return NextResponse.json({ count: facilities.length, facilities });
      }

      case "activity": {
        const facilityId = searchParams.get("facilityId") || "";
        const year = Number(searchParams.get("year") || new Date().getFullYear());
        const data = await prisma.activityData.findMany({
          where: { facilityId, year },
          orderBy: { month: "asc" },
          select: { month: true, activityValue: true },
        });
        return NextResponse.json({
          facilityId, year,
          monthlyData: data.map((d) => ({ month: d.month, value: Number(d.activityValue) })),
        });
      }

      case "kpi": {
        const period = searchParams.get("period");
        const domain = searchParams.get("domain");
        const where: Record<string, unknown> = {};
        if (domain) where.esgDomain = domain;
        const masters = await prisma.kpiMaster.findMany({
          where,
          select: { id: true, code: true, name: true, category: true, unit: true, esgDomain: true },
          take: 30,
        });
        if (!period) return NextResponse.json({ count: masters.length, kpis: masters });

        const kpiIds = masters.map((m) => m.id);
        const targets = await prisma.kpiTarget.findMany({
          where: { kpiId: { in: kpiIds }, period },
          select: { kpiId: true, targetValue: true },
        });
        const performances = await prisma.kpiPerformance.findMany({
          where: { kpiId: { in: kpiIds }, period },
          select: { kpiId: true, actualValue: true },
        });
        const tMap = Object.fromEntries(targets.map((t) => [t.kpiId, Number(t.targetValue)]));
        const pMap = Object.fromEntries(performances.map((p) => [p.kpiId, Number(p.actualValue)]));
        return NextResponse.json({
          period, count: masters.length,
          kpis: masters.map((m) => ({
            ...m, target: tMap[m.id] ?? null, actual: pMap[m.id] ?? null,
          })),
        });
      }

      case "employees": {
        const worksiteId = searchParams.get("worksiteId");
        const name = searchParams.get("name");
        const department = searchParams.get("department");
        const where: Record<string, unknown> = {};
        if (worksiteId) where.worksiteId = worksiteId;
        if (name) where.name = { contains: name };
        if (department) where.department = { contains: department };
        const employees = await prisma.employee.findMany({
          where,
          select: {
            id: true, name: true, department: true, team: true,
            commuteTransport: true, fuel: true,
            commuteDistanceKm: true, workDaysPerMonth: true,
            monthlyCommuteEmission: true,
          },
          take: 50,
          orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json({
          count: employees.length,
          employees: employees.map((e) => ({
            ...e,
            commuteDistanceKm: e.commuteDistanceKm ? Number(e.commuteDistanceKm) : null,
            monthlyCommuteEmission: e.monthlyCommuteEmission ? Number(e.monthlyCommuteEmission) : null,
          })),
        });
      }

      case "esg": {
        const esgDomain = searchParams.get("domain") || "environment";
        const esgPeriod = searchParams.get("period");
        const esgWhere: Record<string, unknown> = { esgDomain };
        if (esgPeriod) esgWhere.period = esgPeriod;
        const metrics = await prisma.esgMetric.findMany({
          where: esgWhere,
          select: {
            id: true, category: true, indicatorName: true,
            value: true, unit: true, period: true, status: true,
          },
          take: 50,
        });
        return NextResponse.json({ domain: esgDomain, count: metrics.length, metrics });
      }

      case "dashboard": {
        const dashYear = Number(searchParams.get("year") || new Date().getFullYear());
        const facilityCount = await prisma.emissionFacility.count({ where: { status: "active" } });
        const activityCount = await prisma.activityData.count({ where: { year: dashYear } });
        const kpiCount = await prisma.kpiMaster.count();
        return NextResponse.json({
          year: dashYear, activeFacilities: facilityCount,
          activityDataEntries: activityCount, totalKpis: kpiCount,
        });
      }

      case "emission-factors": {
        const efScope = searchParams.get("scope");
        const efCategory = searchParams.get("category");
        const efWhere: Record<string, unknown> = { active: true };
        if (efScope) efWhere.scope = Number(efScope);
        if (efCategory) efWhere.fuelCode = { contains: efCategory };
        const factors = await prisma.emissionFactorMaster.findMany({
          where: efWhere,
          select: {
            id: true, factorCode: true, scope: true, fuelCode: true,
            sourceName: true, co2Factor: true, ch4Factor: true, n2oFactor: true,
            co2FactorUnit: true, year: true,
          },
          take: 30,
          orderBy: { year: "desc" },
        });
        return NextResponse.json({
          count: factors.length,
          factors: factors.map((f) => ({
            ...f,
            co2Factor: f.co2Factor ? Number(f.co2Factor) : null,
            ch4Factor: f.ch4Factor ? Number(f.ch4Factor) : null,
            n2oFactor: f.n2oFactor ? Number(f.n2oFactor) : null,
          })),
        });
      }

      default:
        return NextResponse.json({ error: "Unknown tool. Available: facilities, activity, kpi, employees, esg, dashboard, emission-factors" }, { status: 400 });
    }
  } catch (err) {
    console.error("[chatbot-tools GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "save-activity": {
        const { facilityId, year, values } = body;
        const facility = await prisma.emissionFacility.findUnique({ where: { id: facilityId } });
        if (!facility) return NextResponse.json({ error: "배출시설을 찾을 수 없습니다." }, { status: 404 });

        for (let month = 1; month <= 12; month++) {
          const val = values[month - 1];
          if (val === 0 || val === null || val === undefined) continue;
          await prisma.activityData.upsert({
            where: { uq_activity_data: { facilityId, year, month } },
            create: { facilityId, year, month, activityValue: val },
            update: { activityValue: val },
          });
        }
        await prisma.activityAuditLog.create({
          data: { facilityId, year, action: "챗봇 데이터 입력", actor: "챗봇", detail: `${year}년 활동자료 입력` },
        });
        return NextResponse.json({ ok: true, message: `${facility.facilityName}의 ${year}년 활동자료가 저장되었습니다.` });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("[chatbot-tools POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
