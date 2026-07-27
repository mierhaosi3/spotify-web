import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { siteConfig } from '@/config/site'

/** Light shell for resume / writing — no full WebGL stage */
export function ContentLayout() {
  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-6 font-mono text-[11px] font-bold sm:px-8">
        <nav className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <Link to="/" className="text-foreground transition-colors hover:text-[rgba(253,107,148,0.95)]">
            {siteConfig.name}
          </Link>
          <span className="text-border">/</span>
          <Link to="/resume" className="transition-colors hover:text-foreground">
            Resume
          </Link>
          <Link to="/writing" className="transition-colors hover:text-foreground">
            Writing
          </Link>
        </nav>
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-2xl px-6 pb-16 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
