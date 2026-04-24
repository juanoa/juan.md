import Link from "next/link";

import { Button } from "@juan/ui/components/ui/button";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
      <Link href="/" className="text-sm font-semibold tracking-normal">
        1.01^n
      </Link>
      <nav
        aria-label="Main navigation"
        className="text-muted-foreground text-sm">
        <Button asChild variant="outline">
          <Link href="/thesis">Thesis</Link>
        </Button>
      </nav>
    </header>
  );
}
