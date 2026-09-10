import { NextResponse } from "next/server";
import type { Theme } from "@obsidian/commerce";
import { updateTheme } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

/** Publishes a theme. The storefront reads these tokens on the next request. */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<Theme> | null;
  if (!body) return NextResponse.json({ error: "A theme patch is required." }, { status: 400 });

  const theme = updateTheme(await currentStoreId(), {
    name: body.name,
    preset: body.preset,
    description: body.description,
    colors: body.colors,
    typography: body.typography,
    shape: body.shape,
    layout: body.layout,
  });

  return NextResponse.json({ id: theme.id, preset: theme.preset, updatedAt: theme.updatedAt });
}
