import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, Plus } from "lucide-react";
import { Avatar, Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const db = await currentStore();
  const categories = [...new Set(db.blogPosts.map((p) => p.category))];

  return (
    <>
      <AdminPageHeader
        title="Journal"
        description="Long-form content for SEO and buying guidance. Posts carry their own SEO record and can be linked from any page section."
        breadcrumbs={[{ label: "Storefront" }, { label: "Blog" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New post
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Posts" value={number(db.blogPosts.length)} />
        <Stat label="Published" value={number(db.blogPosts.filter((p) => p.status === "published").length)} />
        <Stat label="Categories" value={number(categories.length)} />
        <Stat
          label="Average read time"
          value={`${Math.round(db.blogPosts.reduce((n, p) => n + p.readMinutes, 0) / Math.max(1, db.blogPosts.length))} min`}
        />
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">All posts</h2>
        </div>
        <ul className="divide-y divide-line">
          {db.blogPosts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                <Image src={post.cover} alt="" fill sizes="96px" className="object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Badge tone="outline" size="xs">
                    {post.category}
                  </Badge>
                  <Badge tone={post.status === "published" ? "success" : "warning"} size="xs">
                    {post.status}
                  </Badge>
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-ink">{post.title}</p>
                <p className="mt-0.5 line-clamp-2x text-[11.5px] leading-snug text-ink-muted">{post.excerpt}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Avatar src={post.authorAvatar} name={post.authorName} size={18} />
                    {post.authorName}
                  </span>
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} min
                  </span>
                  <span>/journal/{post.slug}</span>
                </p>
              </div>

              <div className="flex shrink-0 gap-1.5">
                <button type="button" className={buttonClasses("outline", "xs")}>
                  Edit
                </button>
                <Link
                  href={`/journal/${post.slug}`}
                  target="_blank"
                  className={buttonClasses("ghost", "xs")}
                  aria-label={`View ${post.title}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
