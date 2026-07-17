import { SectionLabel } from '@/components/SectionLabel'
import { TrackListItem } from '@/components/TrackListItem'
import { useTopTracks } from '@/hooks/useTopTracks'

type TopTracksProps = {
  limit?: number
}

export function TopTracks({ limit = 4 }: TopTracksProps) {
  const { tracks, loading, error } = useTopTracks(limit)

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Top Tracks</SectionLabel>

      {loading && tracks.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-3.5 w-6 animate-pulse rounded bg-secondary" />
              <div className="size-10 animate-pulse rounded-sm bg-secondary" />
              <div className="h-3.5 flex-1 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-[12px] text-muted-foreground/70">Unable to load</p>
      ) : tracks.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/70">No top tracks yet</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tracks.map((track, i) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={i + 1}
              size="md"
            />
          ))}
        </div>
      )}
    </section>
  )
}
