import { useEffect, useRef } from 'react'
import type { ClearZone } from '@/components/clearZone'
import { cn } from '@/lib/utils'

const PIXEL = 5

type Speck = { x: number; y: number; vy: number; alpha: number }

type PixelDustProps = {
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

/**
 * Sparse floating dust for clear weather — sides only.
 */
export function PixelDust({
  clearZone = null,
  paused = false,
  className,
}: PixelDustProps) {
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
    let specks: Speck[] = []
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

    const makeSpeck = (leftCol: number, rightCol: number): Speck => ({
      x: spawnX(cols, leftCol, rightCol),
      y: rand(0, rows),
      vy: rand(-0.08, -0.02),
      alpha: rand(0.15, 0.4),
    })

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w < 2 || h < 2) return
      cols = Math.max(8, Math.floor(w / PIXEL))
      rows = Math.max(8, Math.floor(h / PIXEL))
      canvas.width = cols
      canvas.height = rows
      const { leftCol, rightCol } = zoneCols()
      const sideCols = Math.max(1, cols - (rightCol - leftCol))
      const target = Math.floor(sideCols * 0.35)
      specks = Array.from({ length: Math.max(12, Math.min(target, 40)) }, () =>
        makeSpeck(leftCol, rightCol),
      )
    }

    const draw = () => {
      if (!running) return
      rafId = requestAnimationFrame(draw)
      if (pausedRef.current || cols === 0) return
      const { leftCol, rightCol } = zoneCols()
      ctx.clearRect(0, 0, cols, rows)
      for (const s of specks) {
        s.y += s.vy
        if (s.y < 0) {
          Object.assign(s, makeSpeck(leftCol, rightCol), { y: rows })
        }
        if (s.x >= leftCol && s.x < rightCol) {
          s.x = spawnX(cols, leftCol, rightCol)
        }
        ctx.fillStyle = `rgba(255, 230, 200, ${s.alpha})`
        ctx.fillRect(s.x, Math.floor(s.y), 1, 1)
      }
    }

    resize()
    draw()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => {
      running = false
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full opacity-70', className)}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
    />
  )
}
