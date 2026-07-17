import type { ClearZone } from '@/components/clearZone'
import { PixelRain } from '@/labs/rain/PixelRain'
import { cn } from '@/lib/utils'

type AmbientWaveProps = {
  clearZone?: ClearZone | null
  paused?: boolean
  className?: string
}

/**
 * Pixel rain weather behind the garden (sides only via clearZone).
 */
export function AmbientWave({
  clearZone = null,
  paused = false,
  className,
}: AmbientWaveProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0',
        paused && 'invisible',
        className,
      )}
      aria-hidden
    >
      <PixelRain clearZone={clearZone} paused={paused} />
    </div>
  )
}
