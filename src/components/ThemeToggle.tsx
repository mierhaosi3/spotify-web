import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

/** Locks UI to dark or light — does not follow system. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="Theme lock"
    >
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
          theme === 'dark'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={theme === 'dark'}
      >
        <Moon className="size-3" />
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
          theme === 'light'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={theme === 'light'}
      >
        <Sun className="size-3" />
        Light
      </button>
    </div>
  )
}
