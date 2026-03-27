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
      facilityTypes: w.facilityTypes ? JSON.parse(w.facilityTypes) : [],
      energySources: w.energySources ? JSON.parse(w.energySources) : [],
      typeOptions: w.typeOptions ? JSON.parse(w.typeOptions) : {},
    }));

    const defaultRow = worksiteRows.find((w) => w.isDefault === true);
    const defaultWorksiteId = defaultRow?.id ?? worksiteRows[0]?.id ?? undefined;

    return NextResponse.json({
      organizationName: org.organizationName,
      organizationAddress: org.address ?? "",
      organizationAddressDetail: org.addressDetail ?? undefined,
      worksites,
      defaultWorksiteId,
      industry: org.industry ?? "",
      country: org.country ?? "",
      employeeCount: org.employeeCount ?? "",
      revenue: org.revenue ?? "",
      scope3Categories: org.scope3Categories ? JSON.parse(org.scope3Categories) : null,
      selectedFrameworks: org.selectedFrameworks ? JSON.parse(org.selectedFrameworks) : [],
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
      industry,
      country,
      employeeCount,
      revenue,
      scope1Enabled,
      scope2Enabled,
      scope3Enabled,
      scope3Categories,
      selectedFrameworks,
    } = body as {
      organizationName: string;
      organizationAddress?: string;
      organizationAddressDetail?: string;
      worksites: { id: string; name: string; address: string; addressDetail?: string; facilityTypes?: string[]; energySources?: string[]; typeOptions?: Record<string, string[]> }[];
      defaultWorksiteId?: string;
      industry?: string;
      country?: string;
      employeeCount?: string;
      revenue?: string;
      scope1Enabled?: boolean;
      scope2Enabled?: boolean;
      scope3Enabled?: boolean;
      scope3Categories?: string[];
      selectedFrameworks?: string[];
    };

    // 조직 정보 upsert (단일 행)
    let org = await prisma.organization.findFirst({ orderBy: { id: "asc" } });
    if (org) {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: {
          organizationName: organizationName || "조직",
          ...(organizationAddress !== undefined && { address: organizationAddress }),
          ...(organizationAddressDetail !== undefined && { addressDetail: organizationAddressDetail }),
          ...(industry !== undefined && { industry }),
          ...(country !== undefined && { country }),
          ...(employeeCount !== undefined && { employeeCount }),
          ...(revenue !== undefined && { revenue }),
          ...(scope1Enabled !== undefined && { scope1Enabled }),
          ...(scope2Enabled !== undefined && { scope2Enabled }),
          ...(scope3Enabled !== undefined && { scope3Enabled }),
          ...(scope3Categories !== undefined && { scope3Categories: JSON.stringify(scope3Categories) }),
          ...(selectedFrameworks !== undefined && { selectedFrameworks: JSON.stringify(selectedFrameworks) }),
        },
      });
    } else {
      org = await prisma.organization.create({
        data: {
          organizationName: organizationName || "조직",
          address: organizationAddress || "",
          addressDetail: organizationAddressDetail ?? null,
          industry: industry ?? null,
          country: country ?? null,
          employeeCount: employeeCount ?? null,
          revenue: revenue ?? null,
          scope1Enabled: scope1Enabled ?? true,
          scope2Enabled: scope2Enabled ?? true,
          scope3Enabled: scope3Enabled ?? true,
          scope3Categories: scope3Categories ? JSON.stringify(scope3Categories) : null,
          selectedFrameworks: selectedFrameworks ? JSON.stringify(selectedFrameworks) : null,
        },
      });
    }

    const orgId = org.id;

    // worksites가 명시적으로 전달된 경우에만 사업장 처리 (빈 배열 포함 undefined면 스킵)
    if (worksites !== undefined) {
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
          facilityTypes: w.facilityTypes ? JSON.stringify(w.facilityTypes) : null,
          energySources: w.energySources ? JSON.stringify(w.energySources) : null,
          typeOptions: w.typeOptions ? JSON.stringify(w.typeOptions) : null,
          isDefault,
          sortOrder: i,
        },
        create: {
          id: w.id,
          organizationId: orgId,
          name: w.name || "사업장",
          address: w.address || "",
          addressDetail: w.addressDetail ?? null,
          facilityTypes: w.facilityTypes ? JSON.stringify(w.facilityTypes) : null,
          energySources: w.energySources ? JSON.stringify(w.energySources) : null,
          typeOptions: w.typeOptions ? JSON.stringify(w.typeOptions) : null,
          isDefault,
          sortOrder: i,
        },
      });
    }
    } // end if (worksites !== undefined)

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/organization]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
