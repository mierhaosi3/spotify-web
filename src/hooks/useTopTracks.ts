import { useSpotifyDashboard } from '@/hooks/SpotifyDashboardProvider'
import type { TrackSummary } from '@/lib/api'

type State = {
  tracks: TrackSummary[]
  loading: boolean
  error: string | null
}

/** Reads from shared dashboard fetch — `limit` kept for call-site compat. */
export function useTopTracks(_limit = 4): State {
  const { topTracks, loading, error } = useSpotifyDashboard()
  return { tracks: topTracks, loading, error }
}
