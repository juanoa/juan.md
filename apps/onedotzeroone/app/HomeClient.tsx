"use client";

import { useMemo, useState } from "react";
import type { FilterType, ItemType, LibraryItem } from "./items";

const ITEM_TYPES: Array<{ id: FilterType; label: string; glyph: string }> = [
  { id: "all", label: "All", glyph: "◇" },
  { id: "article", label: "Articles", glyph: "¶" },
  { id: "essay", label: "Essays", glyph: "§" },
  { id: "book", label: "Books", glyph: "▣" },
  { id: "video", label: "Videos", glyph: "▶" },
];

function formatTime(minutes: number, type: ItemType) {
  if (type === "book") {
    return `${Math.round(minutes / 60)}h read`;
  }

  if (type === "video") {
    return `${minutes} min watch`;
  }

  return `${minutes} min read`;
}

function itemTypeCount(items: LibraryItem[], type: FilterType) {
  if (type === "all") {
    return items.length;
  }

  return items.filter((item) => item.type === type).length;
}

export function HomeClient({ items }: { items: LibraryItem[] }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [saved, setSaved] = useState(() => new Set([5, 13, 26]));

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return items;
    }

    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  function toggleSave(id: number) {
    setSaved((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <div className="bg-background text-foreground min-h-full">
      <section className="max-w-[980px] px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
        <div className="text-muted-foreground mb-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-[0.14em] uppercase">
          <span>Curated library</span>
          <span className="bg-muted-foreground h-1 w-1 rounded-full" />
          <span>Vol. 01</span>
          <span className="bg-muted-foreground h-1 w-1 rounded-full" />
          <span>{items.length} entries</span>
          <span className="bg-muted-foreground h-1 w-1 rounded-full" />
          <span>Evergreen only</span>
        </div>

        <h1 className="max-w-[920px] text-[clamp(2.6rem,7vw,4.25rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance">
          Reading for engineers,
          <br />
          <i className="text-muted-foreground font-light">
            chosen the way a mentor would.
          </i>
        </h1>

        <p className="mt-9 max-w-xl text-sm leading-[1.75]">
          Articles, essays, books and talks worth the hours. Nothing trending,
          nothing machine-written - the kind of material that will still be true
          in a decade. Especially for people who entered the field after the
          models did.
        </p>
      </section>

      <div className="bg-background sticky top-0 z-10 flex flex-col justify-between gap-4 border-y px-6 py-5 sm:flex-row sm:items-center sm:px-12">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ITEM_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`relative inline-flex items-baseline gap-1.5 py-1.5 text-xs transition-colors ${
                filter === type.id
                  ? "text-foreground after:bg-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setFilter(type.id)}>
              {type.label}
              <span className="text-muted-foreground text-[9px] tabular-nums">
                {itemTypeCount(items, type.id)}
              </span>
            </button>
          ))}
        </div>

        <div className="text-muted-foreground text-[11px] tabular-nums">
          {String(filteredItems.length).padStart(2, "0")} /{" "}
          {String(items.length).padStart(2, "0")} entries
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {filteredItems.map((item, index) => {
          const type = ITEM_TYPES.find((entry) => entry.id === item.type);
          const isSaved = saved.has(item.id);

          return (
            <article
              key={item.slug}
              className="home-card group hover:bg-muted border-b p-6 transition-colors sm:p-8 md:border-r md:even:border-r-0 lg:min-h-[260px] lg:p-10"
              style={{ animationDelay: `${index * 30}ms` }}>
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-muted-foreground inline-flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase">
                    <span className="text-foreground text-sm">
                      {type?.glyph}
                    </span>
                    <span>{item.type}</span>
                    <span className="text-border">/</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <button
                    type="button"
                    aria-label={isSaved ? "Unsave item" : "Save item"}
                    aria-pressed={isSaved}
                    className={`inline-flex h-7 w-7 items-center justify-center transition-colors ${
                      isSaved
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => toggleSave(item.id)}>
                    <svg
                      aria-hidden="true"
                      className="h-4 w-3.5"
                      fill={isSaved ? "currentColor" : "none"}
                      viewBox="0 0 14 16">
                      <path
                        d={
                          isSaved
                            ? "M1 1h12v14l-6-4-6 4z"
                            : "M1.5 1.5h11v13l-5.5-3.5-5.5 3.5z"
                        }
                        stroke={isSaved ? "none" : "currentColor"}
                        strokeWidth={isSaved ? undefined : 1.2}
                      />
                    </svg>
                  </button>
                </div>

                <div>
                  <h2 className="text-[26px] leading-[1.15] font-normal tracking-[-0.015em] text-balance">
                    {item.title}
                  </h2>
                  <div className="text-muted-foreground mt-1.5 text-xs">
                    <b className="text-foreground font-medium">{item.author}</b>{" "}
                    · {item.source}
                  </div>
                </div>

                <div
                  className="text-muted-foreground flex-1 text-xs leading-[1.7] opacity-60 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 lg:translate-y-1"
                  dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                />

                <div className="text-muted-foreground flex items-center justify-between border-t border-dashed pt-3 text-[10px] tracking-[0.12em] uppercase tabular-nums">
                  <span>{item.year}</span>
                  <span className="text-foreground">
                    {formatTime(item.minutes, item.type)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="grid gap-10 px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-2 lg:items-center">
        <h2 className="text-5xl leading-[1.05] font-light tracking-[-0.025em] text-balance">
          Keep reading -{" "}
          <i className="text-muted-foreground font-light">
            the full catalog is $19.99.
          </i>
        </h2>

        <div className="flex flex-col items-start gap-5">
          <p className="text-muted-foreground max-w-md text-[13px] leading-[1.75]">
            Thirty entries here. The complete library is larger, kept up by a
            small editorial group, and added to every month. Pay once, read
            forever.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-4 bg-[oklch(0.205_0_0)] px-7 py-4 text-sm font-medium text-[oklch(0.985_0_0)] transition-all hover:brightness-125 active:scale-[0.97]">
            Enroll
            <span className="h-[18px] w-px bg-white/20" />
            <span className="tabular-nums">$19.99</span>
            <span aria-hidden="true">→</span>
          </button>

          <div className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase">
            One-time payment · No subscription
          </div>
        </div>
      </section>

      <style jsx global>{`
        .home-card {
          animation: home-card-in 0.6s ease-out both;
        }

        @keyframes home-card-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
