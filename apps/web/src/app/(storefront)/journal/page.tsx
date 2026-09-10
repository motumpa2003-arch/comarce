import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Avatar, Container, Rule, Section } from "@obsidian/ui";
import { formatDate } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Journal",
  description: "Buying guides, product explainers and stories from behind the storefront.",
};

export default async function JournalPage() {
  const db = await currentStore();
  const [lead, ...posts] = db.blogPosts;
  const categories = [...new Set(db.blogPosts.map((p) => p.category))];

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Journal</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[48px]">
            Guides worth reading
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            Written from returns data, support tickets and the questions customers actually ask before they buy.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[11.5px] text-ink-muted"
              >
                {category}
              </span>
            ))}
          </div>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          {lead && (
            <Link
              href={`/journal/${lead.slug}`}
              className="group grid gap-8 border-b border-line pb-12 lg:grid-cols-2 lg:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-muted">
                <Image
                  src={lead.cover}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
                  {lead.category} · Featured
                </p>
                <h2 className="mt-3 font-display text-[30px] leading-[1.15] text-ink sm:text-[38px]">
                  {lead.title}
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{lead.excerpt}</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar src={lead.authorAvatar} name={lead.authorName} size={34} />
                  <div className="text-[11.5px] text-ink-muted">
                    <p className="text-ink">{lead.authorName}</p>
                    <p className="flex items-center gap-2">
                      {formatDate(lead.publishedAt)}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lead.readMinutes} min
                      </span>
                    </p>
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                  Read the guide
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-muted">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(min-width:1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                  {post.category}
                </p>
                <h3 className="mt-2 font-display text-[20px] leading-tight text-ink transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2x text-[12.5px] leading-relaxed text-ink-muted">{post.excerpt}</p>
                <p className="mt-3 text-[11px] text-ink-muted">
                  {post.authorName} · {formatDate(post.publishedAt)} · {post.readMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
