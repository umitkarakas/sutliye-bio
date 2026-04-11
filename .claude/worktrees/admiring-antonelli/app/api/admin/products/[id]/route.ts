import { NextResponse } from "next/server";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/server/admin-data";
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
    categoryId?: string;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    badgeLabel?: string;
    isFeatured?: boolean;
  };

  if (!id || !body.categoryId || !body.name || !body.slug || !body.description || !body.imageUrl) {
    return jsonError("Missing required product fields");
  }

  try {
    const product = await updateAdminProduct({
      id,
      categoryId: body.categoryId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      badgeLabel: body.badgeLabel,
      isFeatured: Boolean(body.isFeatured)
    });

    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to update product", 500);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  if (!id) {
    return jsonError("Missing product id");
  }

  try {
    await deleteAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to delete product", 500);
  }
}
