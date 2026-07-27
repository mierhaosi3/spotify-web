import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

export function MarkdownBody({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose-site flex flex-col gap-4 text-[14px] font-normal leading-relaxed text-foreground/90',
        '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight',
        '[&_h2]:mt-4 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-muted-foreground',
        '[&_h3]:mt-2 [&_h3]:text-[13px] [&_h3]:font-bold',
        '[&_p]:text-muted-foreground/90',
        '[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5 [&_ul]:text-muted-foreground/90',
        '[&_a]:text-[rgba(253,107,148,0.9)] [&_a]:underline-offset-2 hover:[&_a]:underline',
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
