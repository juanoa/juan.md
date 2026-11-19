import { getCollection, type CollectionEntry } from "astro:content";

const DEFAULT_LOG_LOCALE = "en";

const translationCtaByLocale: Record<string, string> = {
  en: "Read this article in English",
  es: "Lee este artículo en español",
};

export async function getListedLogs() {
  const logs = await getCollection(
    "logs",
    (entry) =>
      !entry.id.includes("/") && (!import.meta.env.PROD || !entry.data.draft),
  );

  return logs.sort(
    (left, right) =>
      right.data.createdAt.getTime() - left.data.createdAt.getTime() ||
      left.data.title.localeCompare(right.data.title),
  );
}

export function getLogLocale(id: string) {
  const [maybeLocale] = id.split("/");

  return id.includes("/") ? maybeLocale : DEFAULT_LOG_LOCALE;
}

export function getLogHref(id: string) {
  return `/${id}`;
}

export function getTranslationCta(locale: string) {
  return (
    translationCtaByLocale[locale] ??
    `Read this article in ${locale.toUpperCase()}`
  );
}

export function getAlternateLogLinks(
  entryId: string,
  translations: CollectionEntry<"logs">[],
) {
  const alternateLinks = new Map<string, string>();

  alternateLinks.set(getLogLocale(entryId), getLogHref(entryId));

  for (const translation of translations) {
    alternateLinks.set(
      getLogLocale(translation.id),
      getLogHref(translation.id),
    );
  }

  return Array.from(alternateLinks, ([locale, href]) => ({ locale, href }));
}
