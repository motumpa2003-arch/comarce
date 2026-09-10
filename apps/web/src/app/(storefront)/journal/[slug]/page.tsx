import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getBlogPostBySlug, getRecommendations } from "@obsidian/data";
import { Avatar, Breadcrumb, Container, Rule, Section } from "@obsidian/ui";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { formatDate } from "@/lib/format";
import { currentStore, currentStoreId } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(await currentStoreId(), slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover] },
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await currentStore();
  const post = getBlogPostBySlug(db.store.id, slug);
  if (!post) notFound();

  const related = db.blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const more = related.length ? related : db.blogPosts.filter((p) => p.id !== post.id).slice(0, 3);
  const products = getRecommendations(db.store.id, "trending", { limit: 8 });

  return (
    <>
      <div className="border-b border-line bg-muted">
        <Container className="py-3.5">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Journal", href: "/journal" }, { label: post.title }]}
          />
        </Container>
      </div>

      <article>
        <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
          <Image src={post.cover} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/40" />
          <Container size="narrow" className="relative py-16 sm:py-24">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">{post.category}</p>
            <h1 className="mt-4 font-display text-[clamp(30px,5vw,52px)] leading-[1.08] text-inverse">
              {post.title}
            </h1>
            <Rule className="mt-6" />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-inverse/70">{post.excerpt}</p>
            <div className="mt-8 flex items-center gap-3">
              <Avatar src={post.authorAvatar} name={post.authorName} size={38} />
              <div className="text-[12px] text-inverse/60">
                <p className="text-inverse">{post.authorName}</p>
                <p className="flex items-center gap-2">
                  {formatDate(post.publishedAt)}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} min read
                  </span>
                </p>
              </div>
            </div>
          </Container>
        </div>

        <Section tone="surface" spacing="default">
          <Container size="narrow">
            <div className="space-y-6 text-[15.5px] leading-[1.8] text-ink-muted">
              {post.body.split("\n\n").map((paragraph, index) => (
                <p key={index} className={index === 0 ? "text-[17px] leading-[1.7] text-ink" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-3 py-1.5 text-[11.5px] text-ink-muted">
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              href="/journal"
              className="mt-8 inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to the journal
            </Link>
          </Container>
        </Section>
      </article>

      <Section tone="muted" spacing="default">
        <Container>
          <ProductRail
            eyebrow="Mentioned in this guide"
            title="Shop the picks"
            products={toCardList(products, db)}
            ctaHref="/shop"
          />
        </Container>
      </Section>

      <Section tone="surface" spacing="default">
        <Container>
          <h2 className="font-display display-case text-[24px] text-ink">Keep reading</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3">
            {more.map((entry) => (
              <Link key={entry.id} href={`/journal/${entry.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-muted">
                  <Image
                    src={entry.cover}
                    alt=""
                    fill
                    sizes="(min-width:640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                  {entry.category}
                </p>
                <h3 className="mt-1.5 font-display text-[18px] leading-tight text-ink group-hover:text-primary">
                  {entry.title}
                </h3>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
