import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Prisma 마이그레이션 방식으로 전환되었습니다. 'npx prisma migrate deploy'를 사용하세요.",
  });
}
