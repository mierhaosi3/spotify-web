import { Link } from 'react-router-dom'
import { getAllWriting } from '@/lib/content'

export function WritingListPage() {
  const posts = getAllWriting()
  return (
    <div className="flex flex-col gap-8 font-mono">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[rgba(253,107,148,0.75)]">
        // writing
      </p>
      <ul className="flex flex-col gap-6">
        {posts.map((p) => (
          <li key={p.slug} className="flex flex-col gap-1">
            <Link
              to={`/writing/${p.slug}`}
              className="text-[15px] font-bold text-foreground transition-colors hover:text-[rgba(253,107,148,0.95)]"
            >
              {p.title}
            </Link>
            {p.date ? (
              <span className="text-[11px] text-muted-foreground">{p.date}</span>
            ) : null}
            <p className="max-w-xl text-[13px] font-normal text-muted-foreground/85">
              {p.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
