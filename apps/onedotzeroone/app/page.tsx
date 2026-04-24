"use client";

import { useMemo, useState } from "react";

type ItemType = "article" | "essay" | "book" | "video";
type FilterType = "all" | ItemType;

type LibraryItem = {
  id: number;
  title: string;
  author: string;
  source: string;
  type: ItemType;
  minutes: number;
  year: number;
  desc: string;
};

const ITEMS: LibraryItem[] = [
  {
    id: 1,
    title: "The Grug Brained Developer",
    author: "Grug",
    source: "grugbrain.dev",
    type: "essay",
    minutes: 22,
    year: 2022,
    desc: "A plainspoken treatise on complexity - why most senior engineers sound simple and why that is the point.",
  },
  {
    id: 2,
    title: "Teach Yourself Programming in Ten Years",
    author: "Peter Norvig",
    source: "norvig.com",
    type: "essay",
    minutes: 12,
    year: 2001,
    desc: 'The foundational case against the "learn X in 24 hours" genre. Deliberate practice, deep immersion, time.',
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Hunt & Thomas",
    source: "Addison-Wesley",
    type: "book",
    minutes: 480,
    year: 1999,
    desc: "Still the single best career-defining book for working engineers. Reads like a senior sitting next to you.",
  },
  {
    id: 4,
    title: "How to Read a Paper",
    author: "S. Keshav",
    source: "Univ. of Waterloo",
    type: "article",
    minutes: 8,
    year: 2007,
    desc: "The three-pass method. Applies to RFCs, design docs, postmortems - not just academic papers.",
  },
  {
    id: 5,
    title: "Hammock Driven Development",
    author: "Rich Hickey",
    source: "InfoQ",
    type: "video",
    minutes: 40,
    year: 2010,
    desc: "Why thinking - not typing - is the bottleneck. From the creator of Clojure, in his characteristic slow tempo.",
  },
  {
    id: 6,
    title: "The Twelve-Factor App",
    author: "Adam Wiggins",
    source: "12factor.net",
    type: "article",
    minutes: 30,
    year: 2011,
    desc: "A methodology for building software-as-a-service. Old, short, still correct about almost everything.",
  },
  {
    id: 7,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    source: "O'Reilly",
    type: "book",
    minutes: 720,
    year: 2017,
    desc: "The canonical text on distributed systems. Dense, but the one book that will carry a decade of your career.",
  },
  {
    id: 8,
    title: "Worse Is Better",
    author: "Richard Gabriel",
    source: "dreamsongs.com",
    type: "essay",
    minutes: 15,
    year: 1991,
    desc: "Why the ugly thing wins. A parable about Unix, Lisp, and the market that keeps repeating itself.",
  },
  {
    id: 9,
    title: "Falsehoods Programmers Believe About Names",
    author: "Patrick McKenzie",
    source: "kalzumeus.com",
    type: "article",
    minutes: 10,
    year: 2010,
    desc: "The assumptions you don't know you're making. Spawned a genre - and stopped a thousand bad forms.",
  },
  {
    id: 10,
    title: "The Architecture of Open Source Applications",
    author: "Brown & Wilson (eds.)",
    source: "aosabook.org",
    type: "book",
    minutes: 600,
    year: 2012,
    desc: "The authors of real systems explain how they built them. The closest thing to reading code tours at scale.",
  },
  {
    id: 11,
    title: "Growing a Language",
    author: "Guy Steele",
    source: "ACM OOPSLA '98",
    type: "video",
    minutes: 55,
    year: 1998,
    desc: "A talk that teaches you what language design means - while only ever using one-syllable words, then two.",
  },
  {
    id: 12,
    title: "Rich Hickey - Simple Made Easy",
    author: "Rich Hickey",
    source: "InfoQ",
    type: "video",
    minutes: 60,
    year: 2011,
    desc: 'The distinction between "simple" and "easy" - and why mixing them up is how codebases rot.',
  },
  {
    id: 13,
    title: "What Every Programmer Should Know About Memory",
    author: "Ulrich Drepper",
    source: "akkadia.org",
    type: "article",
    minutes: 90,
    year: 2007,
    desc: "Long. Unglamorous. The thing that will finally make cache lines click for you. Worth the afternoon.",
  },
  {
    id: 14,
    title: "The Mythical Man-Month",
    author: "Fred Brooks",
    source: "Addison-Wesley",
    type: "book",
    minutes: 360,
    year: 1975,
    desc: "Adding people to a late project makes it later. Fifty years old; every generation rediscovers this.",
  },
  {
    id: 15,
    title: "Notes on Programming in C",
    author: "Rob Pike",
    source: "lysator.liu.se",
    type: "essay",
    minutes: 18,
    year: 1989,
    desc: "Rules of thumb from one of C's best stylists. Half of what became the Go style guide lives here first.",
  },
  {
    id: 16,
    title: "Are We Really Engineers?",
    author: "Hillel Wayne",
    source: "hillelwayne.com",
    type: "essay",
    minutes: 20,
    year: 2022,
    desc: "An actual bridge engineer turned programmer interviews others like him. What do we borrow, and what don't we?",
  },
  {
    id: 17,
    title: "A Philosophy of Software Design",
    author: "John Ousterhout",
    source: "Yaknyam Press",
    type: "book",
    minutes: 300,
    year: 2018,
    desc: "Deep modules, shallow interfaces. A short book that quietly contradicts half of what you were taught.",
  },
  {
    id: 18,
    title: "The Night Watch",
    author: "James Mickens",
    source: "USENIX ;login:",
    type: "essay",
    minutes: 10,
    year: 2013,
    desc: "A very funny, very true essay about what systems programmers actually do at 3am. Required reading.",
  },
  {
    id: 19,
    title: "Bret Victor - Inventing on Principle",
    author: "Bret Victor",
    source: "vimeo.com",
    type: "video",
    minutes: 54,
    year: 2012,
    desc: "The demo that launched live-coding, observable notebooks, and an entire aesthetic. Watch it twice.",
  },
  {
    id: 20,
    title: "Reflections on Trusting Trust",
    author: "Ken Thompson",
    source: "ACM Turing Award",
    type: "article",
    minutes: 12,
    year: 1984,
    desc: "The original supply-chain attack, explained in six pages by the person who could've actually done it.",
  },
  {
    id: 21,
    title: "The Cathedral and the Bazaar",
    author: "Eric S. Raymond",
    source: "catb.org",
    type: "essay",
    minutes: 45,
    year: 1997,
    desc: "How Linux got built. Dated in places; still the origin text for how open-source communities work.",
  },
  {
    id: 22,
    title: "Crafting Interpreters",
    author: "Robert Nystrom",
    source: "craftinginterpreters.com",
    type: "book",
    minutes: 900,
    year: 2021,
    desc: "Build two full interpreters, one in Java, one in C. The best hands-on CS education you can get for free.",
  },
  {
    id: 23,
    title: "Choose Boring Technology",
    author: "Dan McKinley",
    source: "boringtechnology.club",
    type: "essay",
    minutes: 12,
    year: 2015,
    desc: 'You get a small number of "innovation tokens" per company. Spend them where it matters, boring everywhere else.',
  },
  {
    id: 24,
    title: "Systems Performance",
    author: "Brendan Gregg",
    source: "Pearson",
    type: "book",
    minutes: 900,
    year: 2020,
    desc: "Every performance tool on Linux, explained by the person who built most of them. A reference for life.",
  },
  {
    id: 25,
    title: "The Log: What every software engineer should know...",
    author: "Jay Kreps",
    source: "LinkedIn Eng.",
    type: "article",
    minutes: 60,
    year: 2013,
    desc: "Append-only logs as the foundation under queues, databases, and event systems. Origin story for Kafka.",
  },
  {
    id: 26,
    title: "Jonathan Blow - Preventing the Collapse of Civilization",
    author: "Jonathan Blow",
    source: "youtube.com",
    type: "video",
    minutes: 70,
    year: 2019,
    desc: "A provocative, polarizing talk on software decay. Even if you disagree with half, you'll remember all of it.",
  },
  {
    id: 27,
    title: "On the Criteria to Be Used in Decomposing Systems",
    author: "David Parnas",
    source: "CACM",
    type: "article",
    minutes: 15,
    year: 1972,
    desc: 'Information hiding. The paper every "clean code" book is downstream of - and usually gets half-right.',
  },
  {
    id: 28,
    title: "The Art of Unix Programming",
    author: "Eric S. Raymond",
    source: "catb.org",
    type: "book",
    minutes: 540,
    year: 2003,
    desc: "Unix as a worldview, not an OS. Composition, transparency, and the rule of silence - principles that travel.",
  },
  {
    id: 29,
    title: "Programming as Theory Building",
    author: "Peter Naur",
    source: "Microprocessing...",
    type: "essay",
    minutes: 14,
    year: 1985,
    desc: "The code is not the program. The program is a shared theory in the team's heads. Explains so much.",
  },
  {
    id: 30,
    title: "You Are Not Expected to Understand This",
    author: "Torie Bosch (ed.)",
    source: "Princeton U. Press",
    type: "book",
    minutes: 240,
    year: 2022,
    desc: "Short essays on the most consequential lines of code in history. A lovely way to learn by story.",
  },
];

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

function itemTypeCount(type: FilterType) {
  if (type === "all") {
    return ITEMS.length;
  }

  return ITEMS.filter((item) => item.type === type).length;
}

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [saved, setSaved] = useState(() => new Set([5, 13, 26]));

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return ITEMS;
    }

    return ITEMS.filter((item) => item.type === filter);
  }, [filter]);

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
          <span>30 entries</span>
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
                {itemTypeCount(type.id)}
              </span>
            </button>
          ))}
        </div>

        <div className="text-muted-foreground text-[11px] tabular-nums">
          {String(filteredItems.length).padStart(2, "0")} /{" "}
          {String(ITEMS.length).padStart(2, "0")} entries
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {filteredItems.map((item, index) => {
          const type = ITEM_TYPES.find((entry) => entry.id === item.type);
          const isSaved = saved.has(item.id);

          return (
            <article
              key={item.id}
              className="group hover:bg-muted translate-y-3 animate-[home-card-in_0.6s_ease-out_forwards] border-b p-6 opacity-0 transition-colors sm:p-8 md:border-r md:even:border-r-0 lg:min-h-[260px] lg:p-10"
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

                <p className="text-muted-foreground flex-1 text-xs leading-[1.7] opacity-60 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 lg:translate-y-1">
                  {item.desc}
                </p>

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
        @keyframes home-card-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
