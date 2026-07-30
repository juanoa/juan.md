import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import * as repository from "../../lib/books/repository";
import type { Book, BookInput } from "../../lib/books/types";

export type BooksStatus = "loading" | "ready" | "error";

interface BooksContextValue {
  books: Book[];
  status: BooksStatus;
  error: string | null;
  createBook: (input: BookInput) => Promise<Book>;
  updateBook: (id: string, input: BookInput) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  refresh: () => void;
}

const BooksContext = createContext<BooksContextValue | undefined>(undefined);

function sortBooks(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    if (a.lastReadAt && b.lastReadAt) {
      const dateOrder = b.lastReadAt.localeCompare(a.lastReadAt);
      if (dateOrder !== 0) return dateOrder;
    } else if (a.lastReadAt) {
      return -1;
    } else if (b.lastReadAt) {
      return 1;
    }
    return a.title.localeCompare(b.title, "es");
  });
}

export function BooksContextProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<BooksStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    repository.fetchBooks().then(
      (data) => {
        setBooks(sortBooks(data));
        setStatus("ready");
        setError(null);
      },
      (reason: unknown) => {
        setStatus("error");
        setError(
          reason instanceof Error
            ? reason.message
            : "No se han podido cargar los libros",
        );
      },
    );
  }, []);

  useEffect(() => {
    let isCurrent = true;
    repository.fetchBooks().then(
      (data) => {
        if (!isCurrent) return;
        setBooks(sortBooks(data));
        setStatus("ready");
        setError(null);
      },
      (reason: unknown) => {
        if (!isCurrent) return;
        setStatus("error");
        setError(
          reason instanceof Error
            ? reason.message
            : "No se han podido cargar los libros",
        );
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  const createBook = useCallback(async (input: BookInput) => {
    const book = await repository.createBook(input);
    setBooks((previous) => sortBooks([...previous, book]));
    return book;
  }, []);

  const updateBook = useCallback(async (id: string, input: BookInput) => {
    const book = await repository.updateBook(id, input);
    setBooks((previous) =>
      sortBooks(previous.map((entry) => (entry.id === id ? book : entry))),
    );
    return book;
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await repository.deleteBook(id);
    setBooks((previous) => previous.filter((book) => book.id !== id));
  }, []);

  const value = useMemo<BooksContextValue>(
    () => ({
      books,
      status,
      error,
      createBook,
      updateBook,
      deleteBook,
      refresh,
    }),
    [books, status, error, createBook, updateBook, deleteBook, refresh],
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

export function useBooksContext() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error(
      "useBooksContext must be used within a BooksContextProvider",
    );
  }
  return context;
}
