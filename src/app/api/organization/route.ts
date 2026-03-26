import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/organization — 조직 및 사업장 정보 조회
export async function GET() {
  try {
    const org = await prisma.organization.findFirst({ orderBy: { id: "asc" } });
    if (!org) {
      return NextResponse.json({
        organizationName: "",
        organizationAddress: "",
        organizationAddressDetail: undefined,
        worksites: [],
        defaultWorksiteId: undefined,
      });
    }

    const worksiteRows = await prisma.worksite.findMany({
      where: { organizationId: org.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const worksites = worksiteRows.map((w) => ({
      id: w.id,
      name: w.name,
      address: w.address,
      addressDetail: w.addressDetail ?? undefined,
    }));

    const defaultRow = worksiteRows.find((w) => w.isDefault === true);
    const defaultWorksiteId = defaultRow?.id ?? worksiteRows[0]?.id ?? undefined;

    return NextResponse.json({
      organizationName: org.organizationName,
      organizationAddress: org.address ?? "",
      organizationAddressDetail: org.addressDetail ?? undefined,
      worksites,
      defaultWorksiteId,
    });
  } catch (err: any) {
    console.error("[GET /api/organization]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/organization — 조직 및 사업장 정보 저장
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationName,
      organizationAddress,
      organizationAddressDetail,
      worksites,
      defaultWorksiteId,
    } = body as {
      organizationName: string;
      organizationAddress?: string;
      organizationAddressDetail?: string;
      worksites: { id: string; name: string; address: string; addressDetail?: string }[];
      defaultWorksiteId?: string;
    };

    // 조직 정보 upsert (단일 행)
    let org = await prisma.organization.findFirst({ orderBy: { id: "asc" } });
    if (org) {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: {
          organizationName: organizationName || "조직",
          address: organizationAddress || "",
          addressDetail: organizationAddressDetail ?? null,
        },
      });
    } else {
      org = await prisma.organization.create({
        data: {
          organizationName: organizationName || "조직",
          address: organizationAddress || "",
          addressDetail: organizationAddressDetail ?? null,
        },
      });
    }

    const orgId = org.id;

    // 기존 사업장 ID 목록
    const existingWorksites = await prisma.worksite.findMany({
      where: { organizationId: orgId },
      select: { id: true },
    });
    const existingIds = new Set(existingWorksites.map((w) => w.id));
    const incomingIds = new Set(worksites.map((w) => w.id));

    // 삭제된 사업장 제거
    for (const eid of Array.from(existingIds)) {
      if (!incomingIds.has(eid)) {
        await prisma.worksite.delete({ where: { id: eid } });
      }
    }

    // 사업장 upsert
    for (let i = 0; i < worksites.length; i++) {
      const w = worksites[i];
      const isDefault = w.id === defaultWorksiteId;
      await prisma.worksite.upsert({
        where: { id: w.id },
        update: {
          name: w.name || "사업장",
          address: w.address || "",
          addressDetail: w.addressDetail ?? null,
          isDefault,
          sortOrder: i,
        },
        create: {
          id: w.id,
          organizationId: orgId,
          name: w.name || "사업장",
          address: w.address || "",
          addressDetail: w.addressDetail ?? null,
          isDefault,
          sortOrder: i,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/organization]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
