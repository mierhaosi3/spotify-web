import { MarkdownBody } from '@/components/MarkdownBody'
import { getResume } from '@/lib/content'

export function ResumePage() {
  const resume = getResume()
  return (
    <article className="flex flex-col gap-6 font-mono">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[rgba(253,107,148,0.75)]">
        // resume
      </p>
      <MarkdownBody>{resume.body}</MarkdownBody>
    </article>
  )
}
