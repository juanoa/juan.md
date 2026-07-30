import {
  BookOpenIcon,
  CalendarBlankIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@juan/ui/components/ui/alert-dialog";
import { Badge } from "@juan/ui/components/ui/badge";
import { Button } from "@juan/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@juan/ui/components/ui/dialog";
import { Input } from "@juan/ui/components/ui/input";
import { Label } from "@juan/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

import { searchGoogleBooks } from "../../lib/books/google-books";
import {
  BOOK_STATUSES,
  type Book,
  type BookInput,
  type BookStatus,
  type GoogleBookSearchResult,
} from "../../lib/books/types";
import { useBooksContext } from "./BooksContext";

type RatingFilter = "all" | "unrated" | "1" | "2" | "3" | "4" | "5";
type BookFormStep = "search" | "form";

interface BookDraft {
  googleBooksId: string | null;
  title: string;
  authors: string;
  coverUrl: string;
  publishedDate: string;
  status: BookStatus;
  rating: string;
  lastReadAt: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function getStatusLabel(status: BookStatus): string {
  return BOOK_STATUSES.find((item) => item.value === status)?.label ?? status;
}

function toDraft(book?: Book): BookDraft {
  return {
    googleBooksId: book?.googleBooksId ?? null,
    title: book?.title ?? "",
    authors: book?.authors.join(", ") ?? "",
    coverUrl: book?.coverUrl ?? "",
    publishedDate: book?.publishedDate ?? "",
    status: book?.status ?? "want_to_read",
    rating: book?.rating ? String(book.rating) : "none",
    lastReadAt: book?.lastReadAt ?? "",
  };
}

function toDraftFromGoogleBook(book: GoogleBookSearchResult): BookDraft {
  return {
    googleBooksId: book.googleBooksId,
    title: book.title,
    authors: book.authors.join(", "),
    coverUrl: book.coverUrl ?? "",
    publishedDate: book.publishedDate ?? "",
    status: "want_to_read",
    rating: "none",
    lastReadAt: "",
  };
}

function formatLastReadDate(date: string | null): string {
  if (!date) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(`${date}T00:00:00`),
  );
}

export function BooksLibrary() {
  const { books, status, error, createBook, updateBook, deleteBook, refresh } =
    useBooksContext();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return books.filter((book) => {
      const searchable = [
        book.title,
        book.authors.join(" "),
        book.publishedDate ?? "",
        getStatusLabel(book.status),
        book.status,
        book.rating ? String(book.rating) : "not rated",
        book.lastReadAt ?? "",
        book.coverUrl ?? "",
        book.googleBooksId ?? "",
      ]
        .map(normalize)
        .join(" ");
      const matchesQuery =
        normalizedQuery === "" || searchable.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "unrated" && book.rating === null) ||
        book.rating === Number(ratingFilter);
      return matchesQuery && matchesStatus && matchesRating;
    });
  }, [books, query, ratingFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setActionError(null);
    try {
      await deleteBook(target.id);
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "Unable to remove the book",
      );
    }
  };

  if (status === "loading") {
    return <p className="text-muted-foreground text-sm">Loading books...</p>;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {error ?? "Unable to load books"}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={refresh}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">My library</h2>
          <p className="text-muted-foreground text-sm">
            {books.length === 1
              ? "1 saved book"
              : `${books.length} saved books`}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <PlusIcon /> Add book
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-search">Search your library</Label>
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="books-search"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, author, status, date..."
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as BookStatus | "all")
            }>
            <SelectTrigger id="books-status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BOOK_STATUSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-rating-filter">Rating</Label>
          <Select
            value={ratingFilter}
            onValueChange={(value) => setRatingFilter(value as RatingFilter)}>
            <SelectTrigger id="books-rating-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="unrated">Not rated</SelectItem>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} {rating === 1 ? "star" : "stars"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError && <p className="text-destructive text-sm">{actionError}</p>}

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => setEditingBook(book)}
              onDelete={() => setDeleteTarget(book)}
            />
          ))}
        </div>
      ) : (
        <EmptyBooksState
          hasFilters={
            query !== "" || statusFilter !== "all" || ratingFilter !== "all"
          }
        />
      )}

      <BookDialog
        open={createOpen}
        books={books}
        onOpenChange={setCreateOpen}
        onSubmit={createBook}
      />
      <BookDialog
        open={editingBook !== undefined}
        books={books}
        initialBook={editingBook}
        onOpenChange={(open) => {
          if (!open) setEditingBook(undefined);
        }}
        onSubmit={async (input) => {
          if (!editingBook) return;
          await updateBook(editingBook.id, input);
        }}
      />
      <DeleteBookDialog
        book={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </section>
  );
}

function EmptyBooksState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="border-border text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 border border-dashed p-6 text-center">
      <BookOpenIcon className="size-8" />
      <div>
        <p className="text-foreground font-medium">
          {hasFilters ? "No matches found" : "Your library is empty"}
        </p>
        <p className="mt-1 text-sm">
          {hasFilters
            ? "Try changing your search or filters."
            : "Search for a book to add it to your library."}
        </p>
      </div>
    </div>
  );
}

function BookCard({
  book,
  onEdit,
  onDelete,
}: {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="border-border bg-card flex min-w-0 gap-4 border p-4">
      <BookCover coverUrl={book.coverUrl} title={book.title} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-medium">{book.title}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {book.authors.length > 0
                ? book.authors.join(", ")
                : "Unknown author"}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${book.title}`}
              onClick={onEdit}>
              <PencilSimpleIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${book.title}`}
              onClick={onDelete}>
              <TrashIcon />
            </Button>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5">
          <Badge variant="outline">{getStatusLabel(book.status)}</Badge>
          <RatingDisplay rating={book.rating} />
        </div>
        <div className="text-muted-foreground flex flex-col gap-1 text-xs">
          {book.publishedDate && <span>Published: {book.publishedDate}</span>}
          <span className="flex items-center gap-1">
            <CalendarBlankIcon className="size-3.5" />
            Last read: {formatLastReadDate(book.lastReadAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function BookCover({
  coverUrl,
  title,
}: {
  coverUrl: string | null;
  title: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  if (!coverUrl || hasImageError) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-2/3 w-20 shrink-0 items-center justify-center">
        <BookOpenIcon className="size-6" aria-label={`No cover: ${title}`} />
      </div>
    );
  }
  return (
    <img
      src={coverUrl}
      alt={`Cover of ${title}`}
      className="bg-muted aspect-2/3 w-20 shrink-0 object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasImageError(true)}
    />
  );
}

function RatingDisplay({ rating }: { rating: number | null }) {
  if (!rating) {
    return <Badge variant="secondary">Not rated</Badge>;
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <StarIcon className="size-3.5 fill-current" /> {rating}/5
    </Badge>
  );
}

interface BookDialogProps {
  open: boolean;
  books: Book[];
  initialBook?: Book;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: BookInput) => Promise<unknown>;
}

function BookDialog({
  open,
  books,
  initialBook,
  onOpenChange,
  onSubmit,
}: BookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <BookDialogForm
          key={initialBook?.id ?? "new"}
          books={books}
          initialBook={initialBook}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

type BookDialogFormProps = Omit<BookDialogProps, "open">;

function BookDialogForm({
  books,
  initialBook,
  onOpenChange,
  onSubmit,
}: BookDialogFormProps) {
  const [step, setStep] = useState<BookFormStep>(
    initialBook ? "form" : "search",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookSearchResult[]>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [draft, setDraft] = useState<BookDraft>(() => toDraft(initialBook));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicateGoogleBook = Boolean(
    draft.googleBooksId &&
    books.some(
      (book) =>
        book.id !== initialBook?.id &&
        book.googleBooksId === draft.googleBooksId,
    ),
  );
  const canSave = draft.title.trim() !== "" && !duplicateGoogleBook;

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;
    setSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      setSearchResults(await searchGoogleBooks(searchQuery));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to search for books",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        googleBooksId: draft.googleBooksId,
        title: draft.title,
        authors: draft.authors.split(","),
        coverUrl: draft.coverUrl,
        publishedDate: draft.publishedDate,
        status: draft.status,
        rating: draft.rating === "none" ? null : Number(draft.rating),
        lastReadAt: draft.lastReadAt,
      });
      onOpenChange(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save the book",
      );
      setSubmitting(false);
    }
  };

  if (step === "search") {
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add book</DialogTitle>
          <DialogDescription>
            Search for a book and review its details before saving it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            autoFocus
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchResults([]);
              setHasSearched(false);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Title, author, or ISBN"
          />
          <Button
            type="button"
            disabled={searching || searchQuery.trim() === ""}
            onClick={() => void handleSearch()}>
            <MagnifyingGlassIcon /> {searching ? "Searching..." : "Search"}
          </Button>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {searchResults.length > 0 && (
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {searchResults.map((result) => (
              <button
                key={result.googleBooksId}
                type="button"
                className="border-border hover:bg-muted flex w-full items-center gap-3 border p-2 text-left transition-colors"
                onClick={() => {
                  setDraft(toDraftFromGoogleBook(result));
                  setError(null);
                  setStep("form");
                }}>
                <BookCover coverUrl={result.coverUrl} title={result.title} />
                <span className="min-w-0">
                  <span className="block font-medium">{result.title}</span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {result.authors.length > 0
                      ? result.authors.join(", ")
                      : "Unknown author"}
                  </span>
                  {result.publishedDate && (
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Published: {result.publishedDate}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
        {!searching && hasSearched && searchResults.length === 0 && !error && (
          <p className="text-muted-foreground text-sm">No books found.</p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(toDraft());
              setError(null);
              setStep("form");
            }}>
            Add manually
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{initialBook ? "Edit book" : "Review book"}</DialogTitle>
        <DialogDescription>
          Complete or correct any details you want to save in your library.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
        <BookCover
          coverUrl={draft.coverUrl || null}
          title={draft.title || "Book"}
        />
        <div className="flex flex-col gap-3">
          <FormField label="Title" htmlFor="book-title" required>
            <Input
              id="book-title"
              value={draft.title}
              autoFocus
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Authors" htmlFor="book-authors">
            <Input
              id="book-authors"
              value={draft.authors}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  authors: event.target.value,
                }))
              }
              placeholder="Separate with commas"
            />
          </FormField>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Publication date" htmlFor="book-published-date">
          <Input
            id="book-published-date"
            value={draft.publishedDate}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                publishedDate: event.target.value,
              }))
            }
            placeholder="2024 or 2024-05-17"
          />
        </FormField>
        <FormField label="Last read date" htmlFor="book-last-read-at">
          <Input
            id="book-last-read-at"
            type="date"
            value={draft.lastReadAt}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                lastReadAt: event.target.value,
              }))
            }
          />
        </FormField>
        <FormField label="Status" htmlFor="book-status" required>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                status: value as BookStatus,
              }))
            }>
            <SelectTrigger id="book-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOK_STATUSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Rating" htmlFor="book-rating">
          <Select
            value={draft.rating}
            onValueChange={(value) =>
              setDraft((previous) => ({ ...previous, rating: value }))
            }>
            <SelectTrigger id="book-rating" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not rated</SelectItem>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <FormField label="Cover URL" htmlFor="book-cover-url">
        <Input
          id="book-cover-url"
          type="url"
          value={draft.coverUrl}
          onChange={(event) =>
            setDraft((previous) => ({
              ...previous,
              coverUrl: event.target.value,
            }))
          }
          placeholder="https://..."
        />
      </FormField>
      {duplicateGoogleBook && (
        <p className="text-destructive text-sm">
          This book is already in your library.
        </p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <DialogFooter>
        {!initialBook && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("search")}>
            Back to search
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSave || submitting}
          onClick={() => void handleSubmit()}>
          {submitting ? "Saving..." : initialBook ? "Save changes" : "Add book"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function FormField({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function DeleteBookDialog({
  book,
  onOpenChange,
  onConfirm,
}: {
  book: Book | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={book !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete book?</AlertDialogTitle>
          <AlertDialogDescription>
            {book
              ? `You will remove “${book.title}” from your library. This cannot be undone.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
