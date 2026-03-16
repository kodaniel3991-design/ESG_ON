import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const pool = await getPool();
    const r = pool.request();
    r.input("id", sql.Int, id);
    const result = await r.query(`
      SELECT file_name, file_type, file_data FROM activity_attachments WHERE id = @id
    `);
    if (!result.recordset[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { file_name, file_type, file_data } = result.recordset[0];
    return new NextResponse(file_data, {
      headers: {
        "Content-Type": file_type,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file_name)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[GET /api/attachments/[id]/file]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
