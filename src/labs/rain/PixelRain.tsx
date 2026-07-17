import { useEffect, useRef } from 'react'
import type { ClearZone } from '@/components/clearZone'
import { cn } from '@/lib/utils'

/** Chunk size in CSS pixels — higher = chunkier pixels */
const PIXEL = 4
/** Rain lives in the top portion of the screen, then fades out */
const BAND = 0.6

type Drop = {
  x: number
  y: number
  vy: number
  len: number
  alpha: number
}

type PixelRainProps = {
  clearZone?: ClearZone | null
  paused?: boolean
  className?: string
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function spawnX(cols: number, leftCol: number, rightCol: number) {
  const leftSpan = Math.max(leftCol, 1)
  const rightSpan = Math.max(cols - rightCol, 1)
  if (Math.random() < leftSpan / (leftSpan + rightSpan)) {
    return Math.floor(Math.random() * leftSpan)
  }
  return rightCol + Math.floor(Math.random() * rightSpan)
}

function makeDrop(
  cols: number,
  bandRows: number,
  leftCol: number,
  rightCol: number,
): Drop {
  return {
    x: spawnX(cols, leftCol, rightCol),
    y: rand(-bandRows * 0.35, bandRows * 0.85),
    vy: rand(0.25, 0.65),
    len: Math.floor(rand(2, 4)),
    alpha: rand(0.2, 0.45),
  }
}

/**
 * Soft cool pixel mist — top ~40% only, fades out, skips music lane.
 */
export function PixelRain({
  clearZone = null,
  paused = false,
  className,
}: PixelRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoneRef = useRef(clearZone)
  const pausedRef = useRef(paused)
  zoneRef.current = clearZone
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let bandRows = 0
    let drops: Drop[] = []
    let rafId = 0
    let running = true

    const zoneCols = () => {
      const z = zoneRef.current
      const left = z ? (z.left / 100) * cols : cols * 0.28
      const right = z ? (z.right / 100) * cols : cols * 0.72
      return {
        leftCol: Math.max(1, Math.floor(left)),
        rightCol: Math.min(cols - 1, Math.ceil(right)),
      }
    }

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w < 2 || h < 2) return
      cols = Math.max(8, Math.floor(w / PIXEL))
      rows = Math.max(8, Math.floor(h / PIXEL))
      bandRows = Math.max(4, Math.floor(rows * BAND))
      canvas.width = cols
      canvas.height = rows
      const { leftCol, rightCol } = zoneCols()
      const sideCols = Math.max(1, cols - (rightCol - leftCol))
      // Side margins — a bit denser
      const target = Math.floor(sideCols * 1.5)
      drops = Array.from({ length: Math.max(40, Math.min(target, 130)) }, () =>
        makeDrop(cols, bandRows, leftCol, rightCol),
      )
    }

    const draw = () => {
      if (!running) return
      rafId = requestAnimationFrame(draw)
      if (pausedRef.current || cols === 0) return

      const { leftCol, rightCol } = zoneCols()
      ctx.clearRect(0, 0, cols, rows)

      for (const d of drops) {
        d.y += d.vy
        if (d.y - d.len > bandRows) {
          Object.assign(d, makeDrop(cols, bandRows, leftCol, rightCol), {
            y: -rand(1, 6),
          })
        }
        if (d.x >= leftCol && d.x < rightCol) {
          d.x = spawnX(cols, leftCol, rightCol)
        }

        // Fade to nothing as we approach the bottom of the band
        const t = Math.min(1, Math.max(0, d.y / bandRows))
        const fade = (1 - t) * (1 - t)
        const a = d.alpha * fade
        if (a < 0.02) continue

        const y0 = Math.floor(d.y)
        // Clear blue rain
        ctx.fillStyle = `rgba(80, 160, 255, ${a * 0.55})`
        ctx.fillRect(d.x, y0, 1, d.len)
        ctx.fillStyle = `rgba(130, 200, 255, ${a})`
        ctx.fillRect(d.x, y0 + d.len - 1, 1, 1)
      }
    }

    resize()
    draw()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('resize', resize)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full', className)}
      style={{
        imageRendering: 'pixelated',
        // Extra CSS fade so the band edge softens into the garden
        WebkitMaskImage:
          'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)',
        WebkitMaskSize: '100% 60%',
        maskSize: '100% 60%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'top',
        maskPosition: 'top',
      }}
      aria-hidden
    />
  )
}
