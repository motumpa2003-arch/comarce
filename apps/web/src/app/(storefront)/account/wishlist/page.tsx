import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Wishlist" };

/** The wishlist lives at a top-level route; keep the account link working. */
export default function AccountWishlistPage() {
  redirect("/wishlist");
}
