import { createFileRoute } from "@tanstack/react-router";

import { BooksLibrary } from "../components/books/books-library";
import { Dashboard } from "../components/dashboard";

const PAGE_NAME = "Books";

export const Route = createFileRoute("/books")({
  component: BooksRoute,
  head: () => ({
    meta: [{ title: PAGE_NAME }],
  }),
});

function BooksRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <BooksLibrary />
    </Dashboard>
  );
}
