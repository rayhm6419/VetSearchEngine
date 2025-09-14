import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

function isValidUsername(u: string) {
  return /^[A-Za-z0-9_]{3,20}$/.test(u);
}

export async function POST(request: Request) {
  const ctype = request.headers.get('content-type') || '';
  if (!ctype.includes('application/json')) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim?.();
  const username = body?.username?.trim?.();

  if (!email || !username) {
    return NextResponse.json({ error: "Email and username required" }, { status: 400 });
  }

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username. Use 3–20 chars: letters, numbers, underscore" }, { status: 400 });
  }

  try {
    // Check uniqueness in DB
    const [emailExists, usernameExists] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (usernameExists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    if (emailExists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, username },
      select: { id: true, email: true, username: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("/api/signup error:", err);
    return NextResponse.json({ error: "Signup failed. Please try again later." }, { status: 500 });
  }
}
