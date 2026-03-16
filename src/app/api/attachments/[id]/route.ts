import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const pool = await getPool();
    const r = pool.request();
    r.input("id", sql.Int, id);
    await r.query(`DELETE FROM activity_attachments WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/attachments/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
