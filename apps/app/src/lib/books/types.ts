export type BookStatus = "want_to_read" | "reading" | "read";

export const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: "want_to_read", label: "Quiero leer" },
  { value: "reading", label: "Leyendo" },
  { value: "read", label: "Leído" },
];

export interface Book {
  id: string;
  googleBooksId: string | null;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedDate: string | null;
  status: BookStatus;
  rating: number | null;
  lastReadAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookInput {
  googleBooksId?: string | null;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  publishedDate?: string | null;
  status: BookStatus;
  rating?: number | null;
  lastReadAt?: string | null;
}

export interface GoogleBookSearchResult {
  googleBooksId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedDate: string | null;
}
