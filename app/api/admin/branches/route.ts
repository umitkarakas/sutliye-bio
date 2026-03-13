import { NextResponse } from "next/server";
import { createAdminBranch, listAdminBranches } from "@/lib/server/admin-data";
import { jsonError, requireAdmin } from "@/lib/server/route-helpers";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const branches = await listAdminBranches();
  return NextResponse.json({ branches });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    address?: string;
    district?: string;
    city?: string;
    phone?: string;
    whatsapp?: string;
    mapUrl?: string;
    reviewUrl?: string;
  };

  if (
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
    const branch = await createAdminBranch({
      name: body.name,
      slug: body.slug,
      address: body.address,
      district: body.district,
      city: body.city,
      phone: body.phone,
      whatsapp: body.whatsapp,
      mapUrl: body.mapUrl,
      reviewUrl: body.reviewUrl
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to create branch", 500);
  }
}
