import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getLogHref, getLogLocale } from "@/lib/logs";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const absoluteUrl = (path: string) => new URL(path, site).toString();
  const logs = (await getCollection("logs", (entry) => !entry.data.draft)).sort(
    (left, right) =>
      right.data.createdAt.getTime() - left.data.createdAt.getTime() ||
      left.id.localeCompare(right.id),
  );

  const articles = logs
    .map(
      (entry) =>
        `- [${entry.data.title}](${absoluteUrl(getLogHref(entry.id))}): ${entry.data.description} (Language: ${getLogLocale(entry.id)}).`,
    )
    .join("\n");

  const content = `# Juan Otálora

> Personal website of Juan Otálora, an engineer based in A Coruña, Spain, who enjoys crafting interfaces and making them easy to use.

## Profile

Juan works on the engineering team at MITO and was one of the company's first engineers. He previously worked at Inditex (zara.com). His interests include technology, climbing, surfing, running, and exploring new places.

- [Home](${absoluteUrl("/")}): Work, background, projects, and published articles.
- [Trips](${absoluteUrl("/trips")}): Places Juan has explored.

## Projects

- [Sounds of a bit](https://sounds-of-a-bit.juan.md): Music generated in your browser.
- [1.01^n](https://www.onepointzeroone.dev/): An almanack of evergreen content for software engineers.
- [Collocations](https://collocations.juan.md): A search engine for English collocations.

## Articles

${articles}

## Social profiles

- [GitHub](https://github.com/juanoa): Juan's GitHub profile.
- [LinkedIn](https://linkedin.com/in/juanoa): Juan's LinkedIn profile.
- [X](https://x.com/juanoa_): Juan's X profile.
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
