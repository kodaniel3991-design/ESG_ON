import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const year = req.nextUrl.searchParams.get("year");
  if (!facilityId || !year) {
    return NextResponse.json({ error: "facilityId and year are required" }, { status: 400 });
  }
  try {
    const pool = await getPool();
    const r = pool.request();
    r.input("facilityId", sql.NVarChar(50), facilityId);
    r.input("year", sql.Int, parseInt(year));
    const result = await r.query(`
      SELECT id, facility_id, year, month, file_name, file_type, file_size, created_at
      FROM activity_attachments
      WHERE facility_id = @facilityId AND year = @year
      ORDER BY month, id
    `);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error("[GET /api/attachments]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const facilityId = formData.get("facilityId") as string | null;
    const year = formData.get("year") as string | null;
    const month = formData.get("month") as string | null;

    if (!file || !facilityId || !year || !month) {
      return NextResponse.json({ error: "file, facilityId, year, month are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pool = await getPool();
    const r = pool.request();
    r.input("facilityId", sql.NVarChar(50), facilityId);
    r.input("year", sql.Int, parseInt(year));
    r.input("month", sql.Int, parseInt(month));
    r.input("fileName", sql.NVarChar(500), file.name);
    r.input("fileType", sql.NVarChar(200), file.type || "application/octet-stream");
    r.input("fileSize", sql.Int, file.size);
    r.input("fileData", sql.VarBinary(sql.MAX), buffer);

    const result = await r.query(`
      INSERT INTO activity_attachments (facility_id, year, month, file_name, file_type, file_size, file_data)
      OUTPUT INSERTED.id, INSERTED.file_name, INSERTED.file_type, INSERTED.file_size, INSERTED.month
      VALUES (@facilityId, @year, @month, @fileName, @fileType, @fileSize, @fileData)
    `);
    return NextResponse.json(result.recordset[0]);
  } catch (err: any) {
    console.error("[POST /api/attachments]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
