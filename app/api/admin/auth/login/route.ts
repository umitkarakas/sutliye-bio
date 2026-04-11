import { NextResponse } from "next/server";
import { authenticateAdmin, createSessionToken, getSessionCookieName, touchAdminLogin } from "@/lib/auth";
import { buildAbsoluteUrl } from "@/lib/request-origin";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isJsonRequest = contentType.includes("application/json");
  let email = "";
  let password = "";

  if (isJsonRequest) {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim() || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") || "").trim();
    password = String(formData.get("password") || "");
  }

  const admin = await authenticateAdmin(email, password);

  if (!admin) {
    if (!isJsonRequest) {
      return NextResponse.redirect(buildAbsoluteUrl(request, "/admin/login?status=invalid"), 303);
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await touchAdminLogin(admin.userId);

  const sessionToken = createSessionToken({
    userId: admin.userId,
    email: admin.email,
    role: admin.role
  });
  const response = isJsonRequest
    ? NextResponse.json({ ok: true, email: admin.email, role: admin.role })
    : NextResponse.redirect(buildAbsoluteUrl(request, "/admin"), 303);

  response.cookies.set({
    name: getSessionCookieName(),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
