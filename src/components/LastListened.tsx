import { siteConfig } from '@/config/site'
import type { LastListenedTrack } from '@/lib/api'
import { formatPlayedAt } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SpotifyIcon } from '@/components/SpotifyIcon'

type LastListenedState = {
  track: LastListenedTrack | null
  loading: boolean
  error: string | null
}

type LastListenedProps = {
  state: LastListenedState
}

export function LastListened({ state }: LastListenedProps) {
  const { track, loading, error } = state
  const timeLabel = formatPlayedAt(track?.playedAt ?? null)

  return (
    <section className="flex w-full flex-col items-center gap-3">
      <p className="text-[11px] font-bold text-[rgba(253,107,148,0.78)]">
        // last listened to...
      </p>

      {loading && !track ? (
        <div
          className={cn(
            'flex w-full max-w-md items-center gap-3 rounded-xl border border-white/10',
            'bg-[#121212]/90 px-4 py-3',
          )}
          aria-hidden
        >
          <div className="size-11 shrink-0 animate-pulse rounded-sm bg-white/10" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ) : error && !track ? (
        <p className="text-[11px] text-muted-foreground">Unable to load</p>
      ) : track ? (
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'group flex w-full max-w-md items-center gap-3 rounded-xl border border-white/10',
            'bg-[#121212]/90 px-4 py-3 transition-colors hover:border-[rgba(253,107,148,0.35)]',
          )}
        >
          {track.albumArtUrl ? (
            <img
              src={track.albumArtUrl}
              alt=""
              className="size-11 shrink-0 rounded-sm object-cover"
            />
          ) : (
            <div className="size-11 shrink-0 rounded-sm bg-white/10" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold tracking-wide text-foreground uppercase">
              {track.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {track.artists}
            </p>
          </div>

          <SpotifyIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        </a>
      ) : (
        <p className="text-[11px] text-muted-foreground">Nothing played yet</p>
      )}

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
