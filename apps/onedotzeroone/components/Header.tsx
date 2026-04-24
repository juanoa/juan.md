import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
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
    </header>
  );
}
