import { NextResponse } from "next/server";
import { reorderHomeSections, toggleHomeSection } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

/** Persists the page-builder arrangement for the storefront home page. */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    order?: string[];
    visibility?: Record<string, boolean>;
  } | null;

  if (!body?.order?.length) {
    return NextResponse.json({ error: "A section order is required." }, { status: 400 });
  }

  const storeId = await currentStoreId();
  for (const [sectionId, visible] of Object.entries(body.visibility ?? {})) {
    toggleHomeSection(storeId, sectionId, visible);
  }
  const page = reorderHomeSections(storeId, body.order);

  return NextResponse.json({
    sections: page.sections.map((s) => ({ id: s.id, position: s.position, visible: s.visible })),
    updatedAt: page.updatedAt,
  });
}
