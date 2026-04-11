import { NextResponse } from "next/server";
import { updateAdminCategory } from "@/lib/server/admin-data";
import { jsonError, requireAdmin } from "@/lib/server/route-helpers";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    description?: string;
  };

  if (!id || !body.name || !body.slug) {
    return jsonError("Missing required category fields");
  }

  try {
    const category = await updateAdminCategory({
      id,
      name: body.name,
      slug: body.slug,
      description: body.description
    });

    return NextResponse.json({ category });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to update category", 500);
  }
}
