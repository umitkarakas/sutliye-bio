import { NextResponse } from "next/server";
import { updateBranchProduct } from "@/lib/server/pricing-data";
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
    price?: number;
    stockStatus?: "in_stock" | "out_of_stock" | "hidden";
  };

  if (typeof body.price !== "number" || body.price < 0 || !body.stockStatus) {
    return jsonError("Missing or invalid price payload");
  }

  try {
    const branchProduct = await updateBranchProduct({
      id,
      price: body.price,
      stockStatus: body.stockStatus
    });

    return NextResponse.json({ branchProduct });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to update branch product", 500);
  }
}
