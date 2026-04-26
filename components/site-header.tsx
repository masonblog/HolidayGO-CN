import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CalendarDays, Github } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>HolidayGO · 中国假期政策查询</span>
        </Link>
        <nav className="flex items-center gap-1">
          <a
            href="https://github.com/masonblog/HolidayGO-CN"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="GitHub 仓库"
          >
            <Github className="h-4 w-4" />
          </a>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            关于
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
