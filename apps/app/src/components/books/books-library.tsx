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
  if (!date) return "Sin registrar";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
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
        book.rating ? String(book.rating) : "sin puntuacion",
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
        reason instanceof Error
          ? reason.message
          : "No se ha podido eliminar el libro",
      );
    }
  };

  if (status === "loading") {
    return <p className="text-muted-foreground text-sm">Cargando libros...</p>;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {error ?? "No se han podido cargar los libros"}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={refresh}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Mi biblioteca</h2>
          <p className="text-muted-foreground text-sm">
            {books.length === 1
              ? "1 libro guardado"
              : `${books.length} libros guardados`}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <PlusIcon /> Añadir libro
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-search">Buscar en tu biblioteca</Label>
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="books-search"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título, autor, estado, fecha..."
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-status-filter">Estado</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as BookStatus | "all")
            }>
            <SelectTrigger id="books-status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {BOOK_STATUSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="books-rating-filter">Puntuación</Label>
          <Select
            value={ratingFilter}
            onValueChange={(value) => setRatingFilter(value as RatingFilter)}>
            <SelectTrigger id="books-rating-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unrated">Sin puntuar</SelectItem>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} {rating === 1 ? "estrella" : "estrellas"}
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
          {hasFilters ? "No hay coincidencias" : "Tu biblioteca está vacía"}
        </p>
        <p className="mt-1 text-sm">
          {hasFilters
            ? "Prueba a cambiar la búsqueda o los filtros."
            : "Busca un libro en Google Books para añadirlo."}
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
                : "Autor desconocido"}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${book.title}`}
              onClick={onEdit}>
              <PencilSimpleIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${book.title}`}
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
          {book.publishedDate && <span>Publicado: {book.publishedDate}</span>}
          <span className="flex items-center gap-1">
            <CalendarBlankIcon className="size-3.5" />
            Última lectura: {formatLastReadDate(book.lastReadAt)}
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
        <BookOpenIcon className="size-6" aria-label={`Sin portada: ${title}`} />
      </div>
    );
  }
  return (
    <img
      src={coverUrl}
      alt={`Portada de ${title}`}
      className="bg-muted aspect-2/3 w-20 shrink-0 object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasImageError(true)}
    />
  );
}

function RatingDisplay({ rating }: { rating: number | null }) {
  if (!rating) {
    return <Badge variant="secondary">Sin puntuar</Badge>;
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
    setError(null);
    try {
      setSearchResults(await searchGoogleBooks(searchQuery));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se han podido buscar libros",
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
        reason instanceof Error
          ? reason.message
          : "No se ha podido guardar el libro",
      );
      setSubmitting(false);
    }
  };

  if (step === "search") {
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir libro</DialogTitle>
          <DialogDescription>
            Busca en Google Books y revisa los datos antes de guardarlos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            autoFocus
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Título, autor o ISBN"
          />
          <Button
            type="button"
            disabled={searching || searchQuery.trim() === ""}
            onClick={() => void handleSearch()}>
            <MagnifyingGlassIcon /> {searching ? "Buscando..." : "Buscar"}
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
                      : "Autor desconocido"}
                  </span>
                  {result.publishedDate && (
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Publicado: {result.publishedDate}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
        {!searching &&
          searchQuery !== "" &&
          searchResults.length === 0 &&
          !error && (
            <p className="text-muted-foreground text-sm">
              No se han encontrado libros.
            </p>
          )}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(toDraft());
              setError(null);
              setStep("form");
            }}>
            Añadir manualmente
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>
          {initialBook ? "Editar libro" : "Revisar libro"}
        </DialogTitle>
        <DialogDescription>
          Completa o corrige los datos que quieras guardar en tu biblioteca.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
        <BookCover
          coverUrl={draft.coverUrl || null}
          title={draft.title || "Libro"}
        />
        <div className="flex flex-col gap-3">
          <FormField label="Título" htmlFor="book-title" required>
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
          <FormField label="Autores" htmlFor="book-authors">
            <Input
              id="book-authors"
              value={draft.authors}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  authors: event.target.value,
                }))
              }
              placeholder="Separados por comas"
            />
          </FormField>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Fecha de publicación" htmlFor="book-published-date">
          <Input
            id="book-published-date"
            value={draft.publishedDate}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                publishedDate: event.target.value,
              }))
            }
            placeholder="2024 o 2024-05-17"
          />
        </FormField>
        <FormField label="Fecha de última lectura" htmlFor="book-last-read-at">
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
        <FormField label="Estado" htmlFor="book-status" required>
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
        <FormField label="Puntuación" htmlFor="book-rating">
          <Select
            value={draft.rating}
            onValueChange={(value) =>
              setDraft((previous) => ({ ...previous, rating: value }))
            }>
            <SelectTrigger id="book-rating" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin puntuar</SelectItem>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <FormField label="URL de la portada" htmlFor="book-cover-url">
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
          Este libro ya está en tu biblioteca.
        </p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <DialogFooter>
        {!initialBook && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("search")}>
            Volver a la búsqueda
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={!canSave || submitting}
          onClick={() => void handleSubmit()}>
          {submitting
            ? "Guardando..."
            : initialBook
              ? "Guardar cambios"
              : "Añadir libro"}
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
          <AlertDialogTitle>¿Eliminar libro?</AlertDialogTitle>
          <AlertDialogDescription>
            {book
              ? `Eliminarás “${book.title}” de tu biblioteca. Esta acción no se puede deshacer.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
