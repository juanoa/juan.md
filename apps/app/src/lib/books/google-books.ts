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

  const params = new URLSearchParams({
    q: search,
    printType: "books",
    maxResults: "20",
  });
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error("Unable to search for books");
  }

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
