import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    // 특정 사용자 비밀번호 설정: { email, password }
    let body: { email?: string; password?: string } = {};
    try { body = await request.json(); } catch { /* empty body = admin seed */ }

    if (body.email && body.password) {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user) {
        return NextResponse.json({ ok: false, error: "사용자를 찾을 수 없습니다." }, { status: 404 });
      }
      const hashed = await bcrypt.hash(body.password, 10);
      await prisma.user.update({
        where: { email: body.email },
        data: { password: hashed },
      });
      return NextResponse.json({ ok: true, message: `${user.name} 비밀번호가 설정되었습니다.` });
    }

    // 기본: 관리자 계정 시드
    const email = "admin";
    const password = "1234";
    const hashed = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { password: hashed, isPlatformAdmin: true, approvalStatus: "approved" },
      });
      return NextResponse.json({ ok: true, message: "관리자 계정이 업데이트되었습니다." });
    }

    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "관리자",
        email,
        password: hashed,
        status: "active",
        approvalStatus: "approved",
        isPlatformAdmin: true,
      },
    });

    return NextResponse.json({ ok: true, message: "관리자 계정이 생성되었습니다.", email, password });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
