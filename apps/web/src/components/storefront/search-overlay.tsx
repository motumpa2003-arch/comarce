"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock, Search, Sparkles, Tag, X } from "lucide-react";
import { cn } from "@obsidian/ui";
import { useSearchHistory } from "@/store/shopper";
import { useUi } from "@/store/ui";

interface Suggestion {
  type: "product" | "category" | "brand" | "collection" | "query";
  id: string;
  label: string;
  sublabel?: string;
  image?: string;
  href: string;
}

interface SearchPayload {
  term: string;
  suggestions: Suggestion[];
  trending: string[];
  categories: { label: string; href: string; image: string }[];
  popular: { id: string; label: string; sublabel?: string; image?: string; href: string }[];
}

export function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  const closeSearch = useUi((s) => s.closeSearch);
  const openSearch = useUi((s) => s.openSearch);
  const { recent, push, clear } = useSearchHistory();

  const [term, setTerm] = React.useState("");
  const [data, setData] = React.useState<SearchPayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cursor, setCursor] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* "/" opens search from anywhere, unless the user is typing in a field. */
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open ? closeSearch() : openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openSearch, closeSearch]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((payload: SearchPayload) => {
          if (!cancelled) {
            setData(payload);
            setCursor(-1);
          }
        })
        .catch(() => undefined)
        .finally(() => !cancelled && setLoading(false));
    }, term ? 180 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [term, open]);

  const submit = (value: string) => {
    const query = value.trim();
    if (!query) return;
    push(query);
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const suggestions = data?.suggestions ?? [];

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") return closeSearch();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(suggestions.length - 1, c + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(-1, c - 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const picked = suggestions[cursor];
      if (picked) {
        push(term);
        closeSearch();
        router.push(picked.href);
      } else {
        submit(term);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140]">
      <div
        aria-hidden
        onClick={closeSearch}
        className="absolute inset-0 animate-fade-in bg-obsidian/60 backdrop-blur-[3px]"
      />
      <div className="relative mx-auto w-full max-w-3xl animate-fade-up px-4 pt-[8vh] sm:px-6">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-2xl">
          {/* -------------------------- Input row -------------------------- */}
          <div className="flex items-center gap-3 border-b border-line px-5">
            <Search className="h-[18px] w-[18px] shrink-0 text-ink-muted" />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onKeyDown}
              type="search"
              placeholder="Search products, brands and categories…"
              aria-label="Search"
              className="h-16 w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-muted/70"
            />
            {loading && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-primary" />
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[62vh] overflow-y-auto">
            {term.length >= 2 ? (
              suggestions.length ? (
                <ul className="py-2">
                  {suggestions.map((item, index) => (
                    <li key={`${item.type}-${item.id}`}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          push(term);
                          closeSearch();
                        }}
                        onMouseEnter={() => setCursor(index)}
                        className={cn(
                          "flex items-center gap-3.5 px-5 py-2.5 transition-colors",
                          index === cursor ? "bg-muted" : "hover:bg-muted/70",
                        )}
                      >
                        {item.image ? (
                          <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[2px] bg-muted">
                            <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                            {item.type === "brand" ? <Tag className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] text-ink">{item.label}</span>
                          {item.sublabel && (
                            <span className="block truncate text-[11.5px] text-ink-muted">{item.sublabel}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                          {item.type}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="px-5 pb-1 pt-2">
                    <button
                      type="button"
                      onClick={() => submit(term)}
                      className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border border-line px-3.5 py-2.5 text-[12.5px] text-ink transition-colors hover:border-ink/30"
                    >
                      <span>
                        See all results for <span className="font-medium">“{term}”</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </li>
                </ul>
              ) : loading ? null : (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13.5px] text-ink">No matches for “{term}”</p>
                  <p className="mt-1 text-[12px] text-ink-muted">
                    Check the spelling, or try a broader term like “headphones”.
                  </p>
                </div>
              )
            ) : (
              <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
                <div className="space-y-5">
                  {recent.length > 0 && (
                    <section>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          Recent searches
                        </h3>
                        <button
                          type="button"
                          onClick={clear}
                          className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted underline underline-offset-2 hover:text-ink"
                        >
                          Clear
                        </button>
                      </div>
                      <ul className="space-y-0.5">
                        {recent.map((value) => (
                          <li key={value}>
                            <button
                              type="button"
                              onClick={() => submit(value)}
                              className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-muted"
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                              {value}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section>
                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      Trending searches
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(data?.trending ?? []).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => submit(value)}
                          className="rounded-full border border-line px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      Popular categories
                    </h3>
                    <ul className="grid grid-cols-2 gap-1">
                      {(data?.categories ?? []).slice(0, 6).map((category) => (
                        <li key={category.href}>
                          <Link
                            href={category.href}
                            onClick={closeSearch}
                            className="block truncate rounded-[var(--radius-sm)] px-2 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                          >
                            {category.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <h3 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    <Sparkles className="h-3 w-3 text-accent" />
                    Popular right now
                  </h3>
                  <ul className="space-y-1">
                    {(data?.popular ?? []).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-muted"
                        >
                          {item.image && (
                            <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[2px] bg-muted">
                              <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="line-clamp-2x block text-[12.5px] leading-snug text-ink">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] font-medium text-ink">{item.sublabel}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-muted px-5 py-2.5 text-[10.5px] text-ink-muted">
            <span className="flex items-center gap-3">
              <Key label="↑↓" /> navigate <Key label="⏎" /> open <Key label="esc" /> close
            </span>
            <span>Powered by Obsidian Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Key({ label }: { label: string }) {
  return (
    <kbd className="rounded-[3px] border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px] text-ink">
      {label}
    </kbd>
  );
}
