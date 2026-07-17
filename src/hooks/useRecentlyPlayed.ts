import { useSpotifyDashboard } from '@/hooks/SpotifyDashboardProvider'
import type { RecentlyPlayedItem } from '@/lib/api'

type State = {
  items: RecentlyPlayedItem[]
  loading: boolean
  error: string | null
}

/** Reads from shared dashboard fetch — args kept for call-site compat. */
export function useRecentlyPlayed(
  _nowPlayingId?: string | null,
  _limit = 4,
): State {
  const { recentlyPlayed, loading, error } = useSpotifyDashboard()
  return { items: recentlyPlayed, loading, error }
}
