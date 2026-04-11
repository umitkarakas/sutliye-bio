import { NextResponse } from "next/server";
import { createAdminProduct, listAdminProducts } from "@/lib/server/admin-data";
import { jsonError, requireAdmin } from "@/lib/server/route-helpers";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const products = await listAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json()) as {
    categoryId?: string;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    badgeLabel?: string;
    initialPrice?: number;
    isFeatured?: boolean;
  };

  if (
    !body.categoryId ||
    !body.name ||
    !body.slug ||
    !body.description ||
    !body.imageUrl ||
    typeof body.initialPrice !== "number" ||
    body.initialPrice < 0
  ) {
    return jsonError("Missing required product fields");
  }

  try {
    const product = await createAdminProduct({
      categoryId: body.categoryId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      badgeLabel: body.badgeLabel,
      initialPrice: body.initialPrice,
      isFeatured: Boolean(body.isFeatured)
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to create product", 500);
  }
}
