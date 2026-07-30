import { supabase } from "../supabase/client";
import type { Book, BookInput, BookStatus } from "./types";

interface BookRow {
  id: string;
  google_books_id: string | null;
  title: string;
  authors: string[];
  cover_url: string | null;
  published_date: string | null;
  status: BookStatus;
  rating: number | null;
  last_read_at: string | null;
  created_at: string;
  updated_at: string;
}

const BOOK_SELECT =
  "id, google_books_id, title, authors, cover_url, published_date, status, rating, last_read_at, created_at, updated_at";

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    googleBooksId: row.google_books_id,
    title: row.title,
    authors: row.authors,
    coverUrl: row.cover_url,
    publishedDate: row.published_date,
    status: row.status,
    rating: row.rating,
    lastReadAt: row.last_read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("You must be signed in to manage books");
  return user.id;
}

function toRow(input: BookInput) {
  return {
    google_books_id: input.googleBooksId?.trim() || null,
    title: input.title.trim(),
    authors: input.authors.map((author) => author.trim()).filter(Boolean),
    cover_url: input.coverUrl?.trim() || null,
    published_date: input.publishedDate?.trim() || null,
    status: input.status,
    rating: input.rating ?? null,
    last_read_at: input.lastReadAt || null,
  };
}

export async function fetchBooks(): Promise<Book[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as BookRow[]).map(mapBook);
}

export async function createBook(input: BookInput): Promise<Book> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("books")
    .insert({ ...toRow(input), user_id: userId })
    .select(BOOK_SELECT)
    .single();
  if (error) throw error;
  return mapBook(data as BookRow);
}

export async function updateBook(id: string, input: BookInput): Promise<Book> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("books")
    .update(toRow(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select(BOOK_SELECT)
    .single();
  if (error) throw error;
  return mapBook(data as BookRow);
}

export async function deleteBook(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
