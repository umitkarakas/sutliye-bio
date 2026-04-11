import { NextResponse } from "next/server";
import { createAdminCategory, listAdminCategories } from "@/lib/server/admin-data";
import { jsonError, requireAdmin } from "@/lib/server/route-helpers";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const categories = await listAdminCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    description?: string;
  };

  if (!body.name || !body.slug) {
    return jsonError("Missing required category fields");
  }

  try {
    const category = await createAdminCategory({
      name: body.name,
      slug: body.slug,
      description: body.description
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to create category", 500);
  }
}
