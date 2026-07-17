import { cn } from '@/lib/utils'

type SectionLabelProps = {
  children: string
  className?: string
}

/** Shared chrome with the garden header — mono + soft rose */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <h2
      className={cn(
        'text-[13px] font-bold tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </h2>
  )
}
