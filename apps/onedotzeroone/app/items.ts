import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type ItemType = "article" | "essay" | "book" | "video";
export type FilterType = "all" | ItemType;

export type LibraryItem = {
  id: number;
  slug: string;
  title: string;
  author: string;
  source: string;
  type: ItemType;
  minutes: number;
  year: number;
  contentHtml: string;
};

type Frontmatter = Record<string, string | number>;

const ITEMS_DIRECTORY = path.join(process.cwd(), "content/items");

function parseMarkdownFile(file: string) {
  const raw = readFileSync(path.join(ITEMS_DIRECTORY, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`Missing frontmatter in ${file}`);
  }

  const frontmatter = parseFrontmatter(match[1]);
  const markdown = match[2].trim();

  return {
    frontmatter,
    markdown,
  };
}

function parseFrontmatter(raw: string): Frontmatter {
  return raw.split("\n").reduce<Frontmatter>((data, line) => {
    if (!line.trim()) {
      return data;
    }

    const match = line.match(/^([^:]+):\s*(.*)$/);

    if (!match) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const key = match[1].trim();
    const value = match[2].trim();
    const unquoted = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    const numeric = Number(unquoted);

    data[key] = Number.isNaN(numeric) ? unquoted : numeric;

    return data;
  }, {});
}

function renderMarkdown(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\n/g, " "))}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function requireString(
  frontmatter: Frontmatter,
  key: string,
  file: string,
): string {
  const value = frontmatter[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing string frontmatter "${key}" in ${file}`);
  }

  return value;
}

function requireNumber(
  frontmatter: Frontmatter,
  key: string,
  file: string,
): number {
  const value = frontmatter[key];

  if (typeof value !== "number") {
    throw new Error(`Missing numeric frontmatter "${key}" in ${file}`);
  }

  return value;
}

function requireItemType(frontmatter: Frontmatter, file: string): ItemType {
  const type = requireString(frontmatter, "type", file);

  if (
    type !== "article" &&
    type !== "essay" &&
    type !== "book" &&
    type !== "video"
  ) {
    throw new Error(`Invalid item type "${type}" in ${file}`);
  }

  return type;
}

export function getItems(): LibraryItem[] {
  return readdirSync(ITEMS_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { frontmatter, markdown } = parseMarkdownFile(file);

      return {
        id: requireNumber(frontmatter, "id", file),
        slug: file.replace(/\.md$/, ""),
        title: requireString(frontmatter, "title", file),
        author: requireString(frontmatter, "author", file),
        source: requireString(frontmatter, "source", file),
        type: requireItemType(frontmatter, file),
        minutes: requireNumber(frontmatter, "minutes", file),
        year: requireNumber(frontmatter, "year", file),
        contentHtml: renderMarkdown(markdown),
      };
    })
    .sort((a, b) => a.id - b.id);
}
