import type { GoogleBookSearchResult } from "./types";

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
}

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryBook[];
}

interface OpenLibraryBook {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

function toSecureUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:/, "https:");
}

export async function searchGoogleBooks(
  query: string,
  signal?: AbortSignal,
): Promise<GoogleBookSearchResult[]> {
  const search = query.trim();
  if (!search) return [];

  try {
    return await searchPrimaryCatalog(search, signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return searchFallbackCatalog(search, signal);
  }
}

async function searchPrimaryCatalog(
  query: string,
  signal?: AbortSignal,
): Promise<GoogleBookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    printType: "books",
    maxResults: "20",
  });
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    { signal },
  );
  if (!response.ok) throw new Error("Primary catalog search failed");

  const payload = (await response.json()) as GoogleBooksResponse;
  return (payload.items ?? [])
    .map((volume) => {
      const info = volume.volumeInfo;
      return {
        googleBooksId: volume.id,
        title: info?.title?.trim() || "Untitled",
        authors: info?.authors ?? [],
        coverUrl: toSecureUrl(
          info?.imageLinks?.thumbnail ?? info?.imageLinks?.smallThumbnail,
        ),
        publishedDate: info?.publishedDate ?? null,
      };
    })
    .filter((book) => book.title !== "Untitled");
}

async function searchFallbackCatalog(
  query: string,
  signal?: AbortSignal,
): Promise<GoogleBookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "20",
    fields: "key,title,author_name,first_publish_year,cover_i",
  });
  const response = await fetch(
    `https://openlibrary.org/search.json?${params.toString()}`,
    { signal },
  );
  if (!response.ok) throw new Error("Unable to search for books");

  const payload = (await response.json()) as OpenLibrarySearchResponse;
  return (payload.docs ?? []).flatMap((book) => {
    const title = book.title?.trim();
    const key = book.key?.trim();
    if (!title || !key) return [];

    return [
      {
        googleBooksId: `openlibrary:${key}`,
        title,
        authors: book.author_name ?? [],
        coverUrl: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        publishedDate: book.first_publish_year
          ? String(book.first_publish_year)
          : null,
      },
    ];
  });
}
