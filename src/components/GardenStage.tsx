import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AmbientWave } from '@/components/AmbientWave'
import type { ClearZone } from '@/components/clearZone'
import { GardenCanvas } from '@/labs/garden/GardenCanvas.jsx'
import { cn } from '@/lib/utils'

export type { ClearZone }

type GardenStageProps = {
  overlay: ReactNode
}

const PAD = 4

/**
 * Layers: pixel rain (sides) → garden plants → scrolling music column.
 * Rain + plants share the same clear lane under the music column.
 */
export function GardenStage({ overlay }: GardenStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const musicRef = useRef<HTMLDivElement>(null)
  const [clearZone, setClearZone] = useState<ClearZone | null>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const music = musicRef.current
    if (!stage || !music) return

    const measure = () => {
      const g = stage.getBoundingClientRect()
      const m = music.getBoundingClientRect()
      if (g.width < 8 || g.height < 8) return

      const left = ((m.left - g.left) / g.width) * 100 - PAD
      const right = ((m.right - g.left) / g.width) * 100 + PAD

      setClearZone({
        left: Math.max(0, left),
        right: Math.min(100, right),
        bottom: 0,
        top: 100,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    ro.observe(music)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <>
      <div
        ref={stageRef}
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden={false}
      >
        <AmbientWave clearZone={clearZone} />
        <div className="pointer-events-auto relative z-[1] h-full w-full">
          <GardenCanvas clearZone={clearZone} plantCount={34} />
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] justify-center">
        <div
          ref={musicRef}
          className="pointer-events-auto relative w-full max-w-2xl"
        >
          {/*
            Visible lane edge (black-on-black was invisible):
            slightly lifted center + soft rose rims that feather into the garden.
          */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 -left-28 -right-28 sm:-left-36 sm:-right-36',
              'supports-[backdrop-filter]:backdrop-blur-[3px]',
            )}
            style={{
              background:
                // Soft lifted lane — wider feather into the garden
                'linear-gradient(to right,' +
                'transparent 0%,' +
                'rgba(255,255,255,0.02) 8%,' +
                'rgba(16,16,22,0.35) 16%,' +
                'rgba(16,16,22,0.7) 26%,' +
                'rgba(16,16,22,0.9) 36%,' +
                'rgba(16,16,22,0.9) 64%,' +
                'rgba(16,16,22,0.7) 74%,' +
                'rgba(16,16,22,0.35) 84%,' +
                'rgba(255,255,255,0.02) 92%,' +
                'transparent 100%)',
            }}
          />

          <div
            className={cn(
              'relative z-10 flex min-h-[100svh] w-full flex-col',
              'px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5',
              'font-mono text-[12px] font-bold leading-snug tracking-tight',
            )}
          >
            {overlay}
          </div>
        </div>
      </div>
    </>
  )
}
