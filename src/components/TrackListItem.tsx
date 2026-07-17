import { cn } from '@/lib/utils'
import type { TrackSummary } from '@/lib/api'

type TrackListItemProps = {
  track: TrackSummary
  index?: number
  meta?: string
  /** sm = compact lists; md = roomier Recently Played */
  size?: 'sm' | 'md'
}

export function TrackListItem({
  track,
  index,
  meta,
  size = 'sm',
}: TrackListItemProps) {
  const md = size === 'md'

  return (
    <a
      href={track.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group flex items-center rounded-sm transition-colors',
        md ? 'gap-3 py-2' : 'gap-2.5 py-0.5',
      )}
    >
      {typeof index === 'number' ? (
        <span
          className={cn(
            'shrink-0 tabular-nums text-[rgba(253,107,148,0.7)]',
            md ? 'w-6 text-[12px]' : 'w-5 text-[10px]',
          )}
        >
          {String(index).padStart(2, '0')}
        </span>
      ) : null}

      {track.albumArtUrl ? (
        <img
          src={track.albumArtUrl}
          alt=""
          className={cn(
            'shrink-0 rounded-sm object-cover',
            md ? 'size-10' : 'size-8',
          )}
        />
      ) : (
        <div
          className={cn(
            'shrink-0 rounded-sm bg-secondary',
            md ? 'size-10' : 'size-8',
          )}
        />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-foreground transition-colors group-hover:text-[#6db840]',
            md ? 'text-[14px]' : 'text-[12px]',
          )}
        >
          {track.name}
        </p>
        <p
          className={cn(
            'truncate text-muted-foreground/80',
            md ? 'mt-0.5 text-[12px]' : 'text-[11px]',
          )}
        >
          {track.artists}
        </p>
      </div>

      {meta ? (
        <span
          className={cn(
            'shrink-0 text-[rgba(253,107,148,0.72)]',
            md ? 'text-[11px]' : 'text-[10px]',
          )}
        >
          {meta}
        </span>
      ) : null}
    </a>
  )
}
