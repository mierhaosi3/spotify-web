import type { ClearZone } from '@/components/clearZone'
import { WaveField } from '@/labs/wave/WaveField'
import { PixelDust } from '@/labs/rain/PixelDust'
import { PixelRain } from '@/labs/rain/PixelRain'
import type { WeatherMood } from '@/lib/weather'
import { cn } from '@/lib/utils'

type AtmosphereLayerProps = {
  mood: WeatherMood
  isDay: boolean
  clearZone?: ClearZone | null
  className?: string
}

/**
 * Garden stays mounted elsewhere; this layer swaps one overlay FX by weather.
 */
export function AtmosphereLayer({
  mood,
  isDay,
  clearZone = null,
  className,
}: AtmosphereLayerProps) {
  const nightDim = !isDay

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0',
        nightDim && mood !== 'clear' && 'opacity-80',
        className,
      )}
      aria-hidden
    >
      {mood === 'rain' && <PixelRain clearZone={clearZone} variant="rain" />}
      {mood === 'snow' && <PixelRain clearZone={clearZone} variant="snow" />}
      {mood === 'clear' && <PixelDust clearZone={clearZone} />}
      {(mood === 'cloud' || mood === 'fog') && (
        <div className="absolute inset-0 opacity-[0.55]">
          <WaveField ambient className="h-full w-full" />
          {mood === 'fog' && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent dark:from-white/5" />
          )}
        </div>
      )}
    </div>
  )
}
