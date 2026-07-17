import { useLayoutEffect, useRef, useState } from 'react'
import { Glass, type GlassOptics } from '@samasante/liquid-glass'
import { SpotifyIcon } from '@/components/SpotifyIcon'
import { siteConfig } from '@/config/site'
import type { LastListenedTrack } from '@/lib/api'
import { formatPlayedAt } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Same family of optics as the Liquid Glass lab notification */
const PANEL_LENS: Partial<GlassOptics> = {
  mapSize: 256,
  clipToShape: true,
  softEdge: true,
  depth: 1,
  curvature: 0.5,
  dispersion: 0.55,
  strength: 0.17,
  bend: 0.7,
  bendWidth: 0.12,
  frost: 3,
  brightness: 0.22,
  specular: 1.3,
  sheenAngle: 50,
  glow: 0.32,
  glowSpread: 1,
  glowFalloff: 1,
  sheen: 1.3,
  sheenWidth: 3,
}

/** Garden-adjacent rose field — refraction readable without neon clash */
const WALLPAPER =
  'radial-gradient(120% 120% at 14% 20%, rgba(253,107,148,0.55) 0%, transparent 48%),' +
  'radial-gradient(120% 120% at 86% 18%, rgba(192,132,252,0.35) 0%, transparent 46%),' +
  'radial-gradient(130% 130% at 70% 90%, rgba(253,107,148,0.4) 0%, transparent 52%),' +
  'linear-gradient(160deg, #1a1018, #0a0a10 55%, #141018)'

type LastListenedState = {
  track: LastListenedTrack | null
  loading: boolean
  error: string | null
}

type GlassNowPlayingProps = {
  state: LastListenedState
}

function useSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      setSize({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}

export function GlassNowPlaying({ state }: GlassNowPlayingProps) {
  const { track, loading, error } = state
  const timeLabel = formatPlayedAt(track?.playedAt ?? null)
  const [panelRef, { w, h }] = useSize()
  const ready = w > 0 && h > 0

  return (
    <section className="flex w-full flex-col items-center gap-3">
      <p className="text-[11px] font-bold text-[rgba(253,107,148,0.78)]">
        // last listened to...
      </p>

      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl"
        style={{ minHeight: 72 }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: WALLPAPER }}
          aria-hidden
        />

        {ready && (
          <Glass
            refract={
              <div
                style={{ position: 'absolute', inset: 0, background: WALLPAPER }}
              />
            }
            behind="#2a1520"
            optics={PANEL_LENS}
            style={{
              position: 'absolute',
              inset: 0,
              width: w,
              height: h,
              borderRadius: 16,
            }}
          />
        )}

        <div
          className={cn(
            'relative z-10 flex items-center px-4 py-3.5',
            'shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.45)]',
          )}
        >
          {loading && !track ? (
            <div className="flex w-full items-center gap-3" aria-hidden>
              <div className="size-12 shrink-0 animate-pulse rounded-md bg-white/15" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/15" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/15" />
              </div>
            </div>
          ) : error && !track ? (
            <p className="text-[11px] text-white/70">Unable to load</p>
          ) : track ? (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center gap-3 transition-opacity hover:opacity-90"
            >
              {track.albumArtUrl ? (
                <img
                  src={track.albumArtUrl}
                  alt=""
                  className="size-11 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="size-11 shrink-0 rounded-sm bg-white/15" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold tracking-wide text-white uppercase">
                  {track.name}
                </p>
                <p className="truncate text-[11px] text-white/70">{track.artists}</p>
              </div>
              <SpotifyIcon className="size-4 shrink-0 text-white/60 transition-colors group-hover:text-white" />
            </a>
          ) : (
            <p className="text-[11px] text-white/65">Nothing played yet</p>
          )}
        </div>
      </div>

      <div className="flex w-full max-w-md items-center justify-between gap-4 text-[11px] text-[rgba(253,107,148,0.72)]">
        <span>{timeLabel}</span>
        <span>{siteConfig.location}</span>
        <a
          href={`mailto:${siteConfig.email}`}
          className="transition-colors hover:text-[rgba(253,107,148,0.95)]"
        >
          Email →
        </a>
      </div>
    </section>
  )
}
