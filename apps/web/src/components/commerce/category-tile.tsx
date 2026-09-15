import Image from "next/image";
import Link from "next/link";
import type { Category } from "@obsidian/commerce";
import { cn } from "@obsidian/ui";

/**
 * A circular photo tile for a category — the "shop by category" look shared
 * between the home page grid and a category page's subcategory row.
 */
export function CategoryTile({
  category,
  className,
  circleClassName = "mx-auto aspect-square w-full max-w-[104px]",
  imageSizes = "104px",
}: {
  category: Pick<Category, "slug" | "name" | "image" | "productCount">;
  /** Classes on the outer link — controls layout (grid cell vs. shrink-0 row item). */
  className?: string;
  /** Classes on the circular image frame — controls the tile's diameter. */
  circleClassName?: string;
  imageSizes?: string;
}) {
  return (
    <Link href={`/category/${category.slug}`} className={cn("group shrink-0 text-center", className)}>
      <div className={cn("relative overflow-hidden rounded-full border border-line bg-surface", circleClassName)}>
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes={imageSizes}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <p className="mt-2.5 line-clamp-2x text-[11.5px] font-medium leading-snug text-ink transition-colors group-hover:text-primary">
        {category.name}
      </p>
      <p className="mt-0.5 text-[10.5px] text-ink-muted">{category.productCount} items</p>
    </Link>
  );
}
