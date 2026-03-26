import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const attachment = await prisma.activityAttachment.findUnique({
      where: { id },
      select: { fileName: true, fileType: true, fileData: true },
    });
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(attachment.fileData, {
      headers: {
        "Content-Type": attachment.fileType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[GET /api/attachments/[id]/file]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
