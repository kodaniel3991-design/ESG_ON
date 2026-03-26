import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const email = "admin@esgon.com";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "관리자 계정이 이미 존재합니다." });
    }

    const hashed = await bcrypt.hash("admin1234!", 10);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "관리자",
        email,
        password: hashed,
        status: "active",
      },
    });

    return NextResponse.json({ ok: true, message: "관리자 계정이 생성되었습니다.", email, password: "admin1234!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
