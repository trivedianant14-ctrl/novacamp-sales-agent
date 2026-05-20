import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildPdfDocument } from "@/src/lib/pdf-templates";
import { storePdf } from "@/src/lib/pdf-store";
import type { GeneratedPdf } from "@/src/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { pdf } = body as { pdf: GeneratedPdf };

    if (!pdf || !pdf.persona) {
      return Response.json({ error: "pdf object with persona is required" }, { status: 400 });
    }

    const doc = buildPdfDocument(pdf);
    const buffer = await renderToBuffer(doc);
    const id = storePdf(buffer);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="novacamp-roadmap.pdf"',
        "X-PDF-Id": id,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/render-pdf]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
