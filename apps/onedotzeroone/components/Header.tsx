import Link from "next/link";

export function Header() {
  return (
    <header className="bg-background/95 sticky top-0 z-10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-normal">
          1.01^n
        </Link>
        <nav
          aria-label="Main navigation"
          className="text-muted-foreground text-sm">
          <Link
            href="/thesis"
            className="hover:text-foreground transition-colors">
            Thesis
          </Link>
        </nav>
      </div>
    </header>
  );
}
