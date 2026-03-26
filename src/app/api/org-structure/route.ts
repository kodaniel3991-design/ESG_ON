import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

// GET /api/org-structure
export async function GET() {
  try {
    const pool = await getPool();
    const [deptResult, teamResult, posResult, dutyResult] = await Promise.all([
      pool.request().query(`SELECT id, name, sort_order FROM org_departments ORDER BY sort_order, name`),
      pool.request().query(`SELECT id, department_id, name, leader_name, default_duty_name, sort_order FROM org_teams ORDER BY sort_order, name`),
      pool.request().query(`SELECT id, name, sort_order FROM org_positions ORDER BY sort_order, name`),
      pool.request().query(`SELECT id, name, sort_order FROM org_duties ORDER BY sort_order, name`),
    ]);
    return NextResponse.json({
      departments: deptResult.recordset,
      teams: teamResult.recordset.map((r: any) => ({ ...r, departmentId: r.department_id, defaultDutyName: r.default_duty_name })),
      positions: posResult.recordset,
      duties: dutyResult.recordset,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/org-structure
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, action, item } = body as {
      type: "department" | "team" | "position";
      action: "upsert" | "delete";
      item: any;
    };
    const pool = await getPool();

    if (action === "delete") {
      const table =
        type === "department"
          ? "org_departments"
          : type === "team"
          ? "org_teams"
          : type === "position"
          ? "org_positions"
          : "org_duties";
      const r = pool.request();
      r.input("id", sql.NVarChar(50), item.id);
      await r.query(`DELETE FROM ${table} WHERE id = @id`);
      return NextResponse.json({ ok: true });
    }

    if (type === "department") {
      const r = pool.request();
      r.input("id", sql.NVarChar(50), item.id);
      r.input("name", sql.NVarChar(100), item.name);
      r.input("sort", sql.Int, item.sort_order ?? 0);
      await r.query(`
        MERGE org_departments AS t USING (SELECT @id AS id) AS s ON t.id = s.id
        WHEN MATCHED THEN UPDATE SET name = @name, sort_order = @sort
        WHEN NOT MATCHED THEN INSERT (id, name, sort_order) VALUES (@id, @name, @sort);
      `);
    } else if (type === "team") {
      const r = pool.request();
      r.input("id", sql.NVarChar(50), item.id);
      r.input("dept_id", sql.NVarChar(50), item.departmentId ?? null);
      r.input("name", sql.NVarChar(100), item.name);
      r.input("leader", sql.NVarChar(100), item.leaderName ?? null);
      r.input("sort", sql.Int, item.sort_order ?? 0);
      r.input("duty_name", sql.NVarChar(100), item.defaultDutyName ?? null);
      await r.query(`
        MERGE org_teams AS t USING (SELECT @id AS id) AS s ON t.id = s.id
        WHEN MATCHED THEN UPDATE SET department_id = @dept_id, name = @name, leader_name = @leader, default_duty_name = @duty_name, sort_order = @sort
        WHEN NOT MATCHED THEN INSERT (id, department_id, name, leader_name, default_duty_name, sort_order) VALUES (@id, @dept_id, @name, @leader, @duty_name, @sort);
      `);
    } else if (type === "position" || type === "duty") {
      const table = type === "position" ? "org_positions" : "org_duties";
      const r = pool.request();
      r.input("id", sql.NVarChar(50), item.id);
      r.input("name", sql.NVarChar(100), item.name);
      r.input("sort", sql.Int, item.sort_order ?? 0);
      await r.query(`
        MERGE ${table} AS t USING (SELECT @id AS id) AS s ON t.id = s.id
        WHEN MATCHED THEN UPDATE SET name = @name, sort_order = @sort
        WHEN NOT MATCHED THEN INSERT (id, name, sort_order) VALUES (@id, @name, @sort);
      `);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
