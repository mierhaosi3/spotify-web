import { useSpotifyDashboard } from '@/hooks/SpotifyDashboardProvider'
import type { SpotifyProfile } from '@/lib/api'

export type { SpotifyProfile }

type State = {
  profile: SpotifyProfile | null
  loading: boolean
  error: string | null
}

export function useSpotifyMe(): State {
  const { profile, loading, error } = useSpotifyDashboard()
  return { profile, loading, error }
}
