import { NextResponse } from "next/server";
import { getPublicBranchBySlug } from "@/lib/server/public-data";
import { jsonError } from "@/lib/server/route-helpers";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  const branch = await getPublicBranchBySlug(slug);

  if (!branch) {
    return jsonError("Branch not found", 404);
  }

  return NextResponse.json({ branch });
}
