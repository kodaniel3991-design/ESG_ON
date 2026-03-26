import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const year = req.nextUrl.searchParams.get("year");
  if (!facilityId || !year) {
    return NextResponse.json({ error: "facilityId and year are required" }, { status: 400 });
  }
  try {
    const attachments = await prisma.activityAttachment.findMany({
      where: { facilityId, year: parseInt(year) },
      select: {
        id: true,
        facilityId: true,
        year: true,
        month: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: [{ month: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(
      attachments.map((a) => ({
        id: a.id,
        facility_id: a.facilityId,
        year: a.year,
        month: a.month,
        file_name: a.fileName,
        file_type: a.fileType,
        file_size: a.fileSize,
        created_at: a.createdAt,
      }))
    );
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

    const created = await prisma.activityAttachment.create({
      data: {
        facilityId,
        year: parseInt(year),
        month: parseInt(month),
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileData: buffer,
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        month: true,
      },
    });

    return NextResponse.json({
      id: created.id,
      file_name: created.fileName,
      file_type: created.fileType,
      file_size: created.fileSize,
      month: created.month,
    });
  } catch (err: any) {
    console.error("[POST /api/attachments]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
