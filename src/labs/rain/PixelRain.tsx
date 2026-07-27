import { useEffect, useRef } from 'react'
import type { ClearZone } from '@/components/clearZone'
import { cn } from '@/lib/utils'

const PIXEL = 4
const BAND = 0.6

type Drop = {
  x: number
  y: number
  vy: number
  len: number
  alpha: number
}

export type PixelRainVariant = 'rain' | 'snow'

type PixelRainProps = {
  clearZone?: ClearZone | null
  paused?: boolean
  variant?: PixelRainVariant
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
  variant: PixelRainVariant,
): Drop {
  const snow = variant === 'snow'
  return {
    x: spawnX(cols, leftCol, rightCol),
    y: rand(-bandRows * 0.35, bandRows * 0.85),
    vy: snow ? rand(0.12, 0.35) : rand(0.25, 0.65),
    len: snow ? 1 : Math.floor(rand(2, 4)),
    alpha: snow ? rand(0.25, 0.55) : rand(0.2, 0.45),
  }
}

/**
 * Pixel rain / snow — top band, sides only via clearZone.
 */
export function PixelRain({
  clearZone = null,
  paused = false,
  variant = 'rain',
  className,
}: PixelRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoneRef = useRef(clearZone)
  const pausedRef = useRef(paused)
  const variantRef = useRef(variant)
  zoneRef.current = clearZone
  pausedRef.current = paused
  variantRef.current = variant

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
      const v = variantRef.current
      const target = Math.floor(sideCols * (v === 'snow' ? 0.9 : 1.05))
      drops = Array.from({ length: Math.max(28, Math.min(target, 120)) }, () =>
        makeDrop(cols, bandRows, leftCol, rightCol, v),
      )
    }

    const draw = () => {
      if (!running) return
      rafId = requestAnimationFrame(draw)
      if (pausedRef.current || cols === 0) return

      const v = variantRef.current
      const { leftCol, rightCol } = zoneCols()
      ctx.clearRect(0, 0, cols, rows)

      for (const d of drops) {
        d.y += d.vy
        if (v === 'snow') d.x += Math.sin(d.y * 0.2) * 0.15
        if (d.y - d.len > bandRows) {
          Object.assign(d, makeDrop(cols, bandRows, leftCol, rightCol, v), {
            y: -rand(1, 6),
          })
        }
        if (d.x >= leftCol && d.x < rightCol) {
          d.x = spawnX(cols, leftCol, rightCol)
        }

        const t = Math.min(1, Math.max(0, d.y / bandRows))
        const fade = (1 - t) * (1 - t)
        const a = d.alpha * fade
        if (a < 0.02) continue

        const y0 = Math.floor(d.y)
        if (v === 'snow') {
          ctx.fillStyle = `rgba(230, 240, 255, ${a})`
          ctx.fillRect(Math.floor(d.x), y0, 1, 1)
        } else {
          ctx.fillStyle = `rgba(80, 160, 255, ${a * 0.55})`
          ctx.fillRect(Math.floor(d.x), y0, 1, d.len)
          ctx.fillStyle = `rgba(130, 200, 255, ${a})`
          ctx.fillRect(Math.floor(d.x), y0 + d.len - 1, 1, 1)
        }
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
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full', className)}
      style={{
        imageRendering: 'pixelated',
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
