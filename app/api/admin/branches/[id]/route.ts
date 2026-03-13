import { NextResponse } from "next/server";
import { updateAdminBranch } from "@/lib/server/admin-data";
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
    address?: string;
    district?: string;
    city?: string;
    phone?: string;
    whatsapp?: string;
    mapUrl?: string;
  };

  if (
    !id ||
    !body.name ||
    !body.slug ||
    !body.address ||
    !body.district ||
    !body.city ||
    !body.phone ||
    !body.whatsapp ||
    !body.mapUrl
  ) {
    return jsonError("Missing required branch fields");
  }

  try {
    const branch = await updateAdminBranch({
      id,
      name: body.name,
      slug: body.slug,
      address: body.address,
      district: body.district,
      city: body.city,
      phone: body.phone,
      whatsapp: body.whatsapp,
      mapUrl: body.mapUrl
    });

    return NextResponse.json({ branch });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to update branch", 500);
  }
}
