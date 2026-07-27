import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getAllWriting, getResume } from '@/lib/content'
import { cn } from '@/lib/utils'

function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="flex flex-col gap-2 border-b border-border/50 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-baseline justify-between gap-3 text-left"
      >
        <h2 className="text-[13px] font-bold tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className="text-[11px] text-[rgba(253,107,148,0.75)]">
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  )
}

/** Home: expandable Experience + Writing summaries; deep links for full pages */
export function SiteContent() {
  const resume = getResume()
  const posts = getAllWriting().slice(0, 3)

  return (
    <div className="flex w-full flex-col gap-8">
      <Disclosure title="Experience" defaultOpen>
        <ul className="flex flex-col gap-4 pt-1">
          {resume.highlights.map((h) => (
            <li key={h.title} className="flex flex-col gap-1">
              <p className="text-[12px] font-bold text-foreground">{h.title}</p>
              <p className="max-w-xl text-[13px] font-normal leading-relaxed text-muted-foreground/85">
                {h.body}
              </p>
            </li>
          ))}
        </ul>
        <Link
          to="/resume"
          className="mt-3 inline-block text-[11px] text-[rgba(253,107,148,0.85)] transition-colors hover:text-[rgba(253,107,148,1)]"
        >
          Full resume →
        </Link>
      </Disclosure>

      <Disclosure title="Writing" defaultOpen>
        <ul className="flex flex-col gap-4 pt-1">
          {posts.map((p) => (
            <li key={p.slug} className="flex flex-col gap-1">
              <Link
                to={`/writing/${p.slug}`}
                className="text-[12px] font-bold text-foreground transition-colors hover:text-[rgba(253,107,148,0.95)]"
              >
                {p.title}
              </Link>
              <p className="max-w-xl text-[13px] font-normal leading-relaxed text-muted-foreground/85">
                {p.summary}
              </p>
            </li>
          ))}
        </ul>
        <Link
          to="/writing"
          className="mt-3 inline-block text-[11px] text-[rgba(253,107,148,0.85)] transition-colors hover:text-[rgba(253,107,148,1)]"
        >
          All writing →
        </Link>
      </Disclosure>
    </div>
  )
}
