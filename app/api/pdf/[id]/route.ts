import { NextRequest } from "next/server";
import { getPdf } from "@/src/lib/pdf-store";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/pdf/[id]">) {
  const { id } = await ctx.params;
  const buffer = getPdf(id);

  if (!buffer) {
    return new Response("PDF not found or expired", { status: 404 });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="novacamp-roadmap.pdf"',
      "Cache-Control": "private, max-age=3600",
    },
  });
}
