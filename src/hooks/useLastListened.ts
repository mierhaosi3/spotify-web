import { useSpotifyDashboard } from '@/hooks/SpotifyDashboardProvider'
import type { LastListenedTrack } from '@/lib/api'

type LastListenedState = {
  track: LastListenedTrack | null
  loading: boolean
  error: string | null
}

export function useLastListened(): LastListenedState {
  const { lastListened, loading, error } = useSpotifyDashboard()
  return { track: lastListened, loading, error }
}
