import { NextResponse } from "next/server";
import { addUser, findUserByEmail, findUserByUsername, isValidUsername } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim?.();
  const username = body?.username?.trim?.();

  if (!email || !username) {
    return NextResponse.json({ error: "Email and username required" }, { status: 400 });
  }

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username. Use 3–20 chars: letters, numbers, underscore" }, { status: 400 });
  }

  if (findUserByUsername(username)) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = addUser(email, username);
  return NextResponse.json({ ok: true, user }, { status: 201 });
}


