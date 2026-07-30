import Link from "next/link";
import { RedDeerIcon, WildBoarIcon } from "./icons/GameIcons";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-tan-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex -space-x-2 text-forest-800">
            <RedDeerIcon badge={false} className="h-7 w-7" />
            <WildBoarIcon badge={false} className="h-7 w-7" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-forest-950">
            Kaliber&shy;Mester
          </span>
        </Link>
        <Link
          href="/wizard"
          className="rounded-full bg-forest-800 px-4 py-2 text-sm font-medium text-tan-50 transition hover:bg-forest-700"
        >
          Kérdőív indítása
        </Link>
      </div>
    </header>
  );
}
