import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return {
      ok: false as const,
      response: jsonError("Unauthorized", 401)
    };
  }

  return {
    ok: true as const,
    session
  };
}
