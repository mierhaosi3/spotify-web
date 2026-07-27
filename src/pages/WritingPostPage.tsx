import { Link, Navigate, useParams } from 'react-router-dom'
import { MarkdownBody } from '@/components/MarkdownBody'
import { getWritingBySlug } from '@/lib/content'

export function WritingPostPage() {
  const { slug } = useParams()
  const post = slug ? getWritingBySlug(slug) : null
  if (!post) return <Navigate to="/writing" replace />

  return (
    <article className="flex flex-col gap-6 font-mono">
      <Link
        to="/writing"
        className="text-[11px] font-bold text-muted-foreground transition-colors hover:text-[rgba(253,107,148,0.9)]"
      >
        ← Writing
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
        {post.date ? (
          <p className="text-[11px] text-muted-foreground">{post.date}</p>
        ) : null}
      </header>
      <MarkdownBody>{post.body}</MarkdownBody>
    </article>
  )
}
