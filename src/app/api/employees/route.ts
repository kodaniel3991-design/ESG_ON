import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/employees?worksiteId=xxx  (worksiteId 생략 시 전체)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const worksiteId = searchParams.get("worksiteId");

    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT e.id, e.worksite_id, w.name AS workplace_name,
             e.department, e.sub_team, e.team, e.is_manager, e.name, e.employee_id, e.position, e.job_position, e.job_title,
             e.employment_status, e.employment_type,
             e.reference_date, e.hire_date, e.termination_date, e.leave_start_date, e.leave_end_date,
             e.gender, e.birth_year, e.nationality, e.is_foreigner, e.is_disabled, e.disability_type,
             e.address, e.address_detail, e.work_address,
             e.commute_transport, e.fuel,
             e.commute_distance_km, e.round_trip_distance_km,
             e.work_days_per_month, e.monthly_commute_emission,
             e.data_source, e.evidence_file_id, e.memo,
             e.sort_order, e.created_at, e.updated_at, e.created_by, e.updated_by
      FROM employees e
      LEFT JOIN worksites w ON w.id = e.worksite_id
    `;
    if (worksiteId) {
      request.input("ws_id", sql.NVarChar(50), worksiteId);
      query += ` WHERE e.worksite_id = @ws_id`;
    }
    query += ` ORDER BY e.sort_order, e.created_at`;

    const result = await request.query(query);
    const employees = result.recordset.map((r: any) => ({
      id: r.id,
      worksiteId: r.worksite_id ?? undefined,
      workplaceName: r.workplace_name ?? undefined,
      department: r.department ?? undefined,
      subTeam: r.sub_team ?? undefined,
      team: r.team ?? undefined,
      isManager: r.is_manager != null ? Boolean(r.is_manager) : undefined,
      name: r.name,
      employeeId: r.employee_id ?? undefined,
      position: r.position ?? undefined,
      jobPosition: r.job_position ?? undefined,
      jobTitle: r.job_title ?? undefined,
      employmentStatus: r.employment_status ?? undefined,
      employmentType: r.employment_type ?? undefined,
      referenceDate: r.reference_date ? new Date(r.reference_date).toISOString().split("T")[0] : undefined,
      hireDate: r.hire_date ? new Date(r.hire_date).toISOString().split("T")[0] : undefined,
      terminationDate: r.termination_date ? new Date(r.termination_date).toISOString().split("T")[0] : undefined,
      leaveStartDate: r.leave_start_date ? new Date(r.leave_start_date).toISOString().split("T")[0] : undefined,
      leaveEndDate: r.leave_end_date ? new Date(r.leave_end_date).toISOString().split("T")[0] : undefined,
      gender: r.gender ?? undefined,
      birthYear: r.birth_year ?? undefined,
      nationality: r.nationality ?? undefined,
      isForeigner: r.is_foreigner != null ? Boolean(r.is_foreigner) : undefined,
      isDisabled: r.is_disabled != null ? Boolean(r.is_disabled) : undefined,
      disabilityType: r.disability_type ?? undefined,
      address: r.address ?? undefined,
      addressDetail: r.address_detail ?? undefined,
      workAddress: r.work_address ?? undefined,
      commuteTransport: r.commute_transport ?? undefined,
      fuel: r.fuel ?? undefined,
      commuteDistanceKm: r.commute_distance_km != null ? Number(r.commute_distance_km) : undefined,
      roundTripDistanceKm: r.round_trip_distance_km != null ? Number(r.round_trip_distance_km) : undefined,
      workDaysPerMonth: r.work_days_per_month ?? undefined,
      monthlyCommuteEmission: r.monthly_commute_emission != null ? Number(r.monthly_commute_emission) : undefined,
      dataSource: r.data_source ?? undefined,
      evidenceFileId: r.evidence_file_id ?? undefined,
      memo: r.memo ?? undefined,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString("ko-KR") : undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString("ko-KR") : undefined,
      createdBy: r.created_by ?? undefined,
      updatedBy: r.updated_by ?? undefined,
    }));

    return NextResponse.json(employees);
  } catch (err: any) {
    console.error("[GET /api/employees]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/employees  — 전체 직원 삭제
export async function DELETE() {
  try {
    const pool = await getPool();
    await pool.request().query(`DELETE FROM employees`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/employees]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/employees  — 사업장별 직원 목록 일괄 저장
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { worksiteId, employees } = body as {
      worksiteId: string | null;
      employees: {
        id: string;
        worksiteId?: string;
        department?: string;
        subTeam?: string;
        team?: string;
        isManager?: boolean;
        name: string;
        employeeId?: string;
        position?: string;
        jobPosition?: string;
        jobTitle?: string;
        employmentStatus?: string;
        employmentType?: string;
        referenceDate?: string;
        hireDate?: string;
        terminationDate?: string;
        leaveStartDate?: string;
        leaveEndDate?: string;
        gender?: string;
        birthYear?: number;
        nationality?: string;
        isForeigner?: boolean;
        isDisabled?: boolean;
        disabilityType?: string;
        address?: string;
        addressDetail?: string;
        workAddress?: string;
        commuteTransport?: string;
        fuel?: string;
        commuteDistanceKm?: number;
        roundTripDistanceKm?: number;
        workDaysPerMonth?: number;
        monthlyCommuteEmission?: number;
        dataSource?: string;
        evidenceFileId?: string;
        memo?: string;
      }[];
    };

    const pool = await getPool();

    // 기존 해당 사업장 직원 ID 목록
    const existReq = pool.request();
    if (worksiteId) {
      existReq.input("ws_id", sql.NVarChar(50), worksiteId);
      const existResult = await existReq.query(
        `SELECT id FROM employees WHERE worksite_id = @ws_id`
      );
      const existingIds = new Set<string>(existResult.recordset.map((r: any) => r.id));
      const incomingIds = new Set<string>(employees.map((e) => e.id));

      for (const eid of Array.from(existingIds)) {
        if (!incomingIds.has(eid)) {
          const d = pool.request();
          d.input("eid", sql.NVarChar(50), eid);
          await d.query(`DELETE FROM employees WHERE id = @eid`);
        }
      }
    }

    for (let i = 0; i < employees.length; i++) {
      const e = employees[i];

      let resolvedId = e.id;
      const lookupReq = pool.request();
      lookupReq.input("ws_id2", sql.NVarChar(50), worksiteId ?? null);
      if (e.employeeId) {
        lookupReq.input("emp_id2", sql.NVarChar(50), e.employeeId);
        const found = await lookupReq.query(
          worksiteId
            ? `SELECT id FROM employees WHERE worksite_id = @ws_id2 AND employee_id = @emp_id2`
            : `SELECT id FROM employees WHERE worksite_id IS NULL AND employee_id = @emp_id2`
        );
        if (found.recordset.length > 0) {
          resolvedId = found.recordset[0].id;
        } else if (worksiteId) {
          const nullReq = pool.request();
          nullReq.input("emp_id3", sql.NVarChar(50), e.employeeId);
          const nullFound = await nullReq.query(
            `SELECT id FROM employees WHERE worksite_id IS NULL AND employee_id = @emp_id3`
          );
          if (nullFound.recordset.length > 0) resolvedId = nullFound.recordset[0].id;
        }
      } else {
        lookupReq.input("name2", sql.NVarChar(100), e.name);
        const found = await lookupReq.query(
          worksiteId
            ? `SELECT id FROM employees WHERE worksite_id = @ws_id2 AND name = @name2`
            : `SELECT id FROM employees WHERE worksite_id IS NULL AND name = @name2`
        );
        if (found.recordset.length > 0) {
          resolvedId = found.recordset[0].id;
        } else if (worksiteId) {
          const nullReq = pool.request();
          nullReq.input("name3", sql.NVarChar(100), e.name);
          const nullFound = await nullReq.query(
            `SELECT id FROM employees WHERE worksite_id IS NULL AND name = @name3`
          );
          if (nullFound.recordset.length > 0) resolvedId = nullFound.recordset[0].id;
        }
      }

      const r = pool.request();
      r.input("id",           sql.NVarChar(50),   resolvedId);
      r.input("ws_id",        sql.NVarChar(50),   worksiteId ?? null);
      r.input("dept",         sql.NVarChar(100),  e.department ?? null);
      r.input("sub_team",     sql.NVarChar(100),  e.subTeam ?? null);
      r.input("team",         sql.NVarChar(100),  e.team ?? null);
      r.input("is_manager",   sql.Bit,            e.isManager != null ? (e.isManager ? 1 : 0) : null);
      r.input("name",         sql.NVarChar(100),  e.name);
      r.input("emp_id",       sql.NVarChar(50),   e.employeeId ?? null);
      r.input("position",     sql.NVarChar(100),  e.position ?? null);
      r.input("job_position", sql.NVarChar(100),  e.jobPosition ?? null);
      r.input("job_title",    sql.NVarChar(100),  e.jobTitle ?? null);
      r.input("emp_status",   sql.NVarChar(50),   e.employmentStatus ?? null);
      r.input("emp_type",     sql.NVarChar(50),   e.employmentType ?? null);
      r.input("ref_date",     sql.Date,           e.referenceDate ? new Date(e.referenceDate) : null);
      r.input("hire_date",    sql.Date,           e.hireDate ? new Date(e.hireDate) : null);
      r.input("term_date",    sql.Date,           e.terminationDate ? new Date(e.terminationDate) : null);
      r.input("leave_start",  sql.Date,           e.leaveStartDate ? new Date(e.leaveStartDate) : null);
      r.input("leave_end",    sql.Date,           e.leaveEndDate ? new Date(e.leaveEndDate) : null);
      r.input("gender",       sql.NVarChar(20),   e.gender ?? null);
      r.input("birth_year",   sql.Int,            e.birthYear ?? null);
      r.input("nationality",  sql.NVarChar(100),  e.nationality ?? null);
      r.input("is_foreigner", sql.Bit,            e.isForeigner != null ? (e.isForeigner ? 1 : 0) : null);
      r.input("is_disabled",  sql.Bit,            e.isDisabled != null ? (e.isDisabled ? 1 : 0) : null);
      r.input("disability_t", sql.NVarChar(100),  e.disabilityType ?? null);
      r.input("address",      sql.NVarChar(500),  e.address ?? null);
      r.input("addr_d",       sql.NVarChar(200),  e.addressDetail ?? null);
      r.input("work_addr",    sql.NVarChar(500),  e.workAddress ?? null);
      r.input("transport",    sql.NVarChar(50),   e.commuteTransport ?? null);
      r.input("fuel",         sql.NVarChar(50),   e.fuel ?? null);
      r.input("dist_km",      sql.Decimal(10, 3), e.commuteDistanceKm ?? null);
      r.input("rt_dist_km",   sql.Decimal(10, 2), e.roundTripDistanceKm ?? null);
      r.input("work_days",    sql.Int,            e.workDaysPerMonth ?? null);
      r.input("monthly_em",   sql.Decimal(12, 4), e.monthlyCommuteEmission ?? null);
      r.input("data_source",  sql.NVarChar(50),   e.dataSource ?? null);
      r.input("evidence_id",  sql.NVarChar(100),  e.evidenceFileId ?? null);
      r.input("memo",         sql.NVarChar(sql.MAX), e.memo ?? null);
      r.input("sort",         sql.Int,            i);

      await r.query(`
        MERGE employees AS target
        USING (SELECT @id AS id) AS source ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET
            worksite_id = @ws_id, department = @dept, sub_team = @sub_team, team = @team, is_manager = @is_manager,
            name = @name, employee_id = @emp_id, position = @position, job_position = @job_position, job_title = @job_title,
            employment_status = @emp_status, employment_type = @emp_type,
            reference_date = @ref_date, hire_date = @hire_date, termination_date = @term_date,
            leave_start_date = @leave_start, leave_end_date = @leave_end,
            gender = @gender, birth_year = @birth_year, nationality = @nationality,
            is_foreigner = @is_foreigner, is_disabled = @is_disabled, disability_type = @disability_t,
            address = @address, address_detail = @addr_d, work_address = @work_addr,
            commute_transport = @transport, fuel = @fuel,
            commute_distance_km = @dist_km, round_trip_distance_km = @rt_dist_km,
            work_days_per_month = @work_days, monthly_commute_emission = @monthly_em,
            data_source = @data_source, evidence_file_id = @evidence_id, memo = @memo,
            sort_order = @sort, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (id, worksite_id, department, sub_team, team, is_manager, name, employee_id, position, job_position, job_title,
                  employment_status, employment_type,
                  reference_date, hire_date, termination_date, leave_start_date, leave_end_date,
                  gender, birth_year, nationality, is_foreigner, is_disabled, disability_type,
                  address, address_detail, work_address, commute_transport, fuel,
                  commute_distance_km, round_trip_distance_km,
                  work_days_per_month, monthly_commute_emission,
                  data_source, evidence_file_id, memo, sort_order)
          VALUES (@id, @ws_id, @dept, @sub_team, @team, @is_manager, @name, @emp_id, @position, @job_position, @job_title,
                  @emp_status, @emp_type,
                  @ref_date, @hire_date, @term_date, @leave_start, @leave_end,
                  @gender, @birth_year, @nationality, @is_foreigner, @is_disabled, @disability_t,
                  @address, @addr_d, @work_addr, @transport, @fuel,
                  @dist_km, @rt_dist_km,
                  @work_days, @monthly_em,
                  @data_source, @evidence_id, @memo, @sort);
      `);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/employees]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
