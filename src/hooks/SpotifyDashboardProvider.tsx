import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchDashboard,
  type DashboardData,
  type LastListenedTrack,
  type RecentlyPlayedItem,
  type SpotifyProfile,
  type TrackSummary,
} from '@/lib/api'

const POLL_MS = 10_000

type DashboardState = {
  profile: SpotifyProfile | null
  lastListened: LastListenedTrack | null
  topTracks: TrackSummary[]
  recentlyPlayed: RecentlyPlayedItem[]
  loading: boolean
  error: string | null
}

const empty: DashboardState = {
  profile: null,
  lastListened: null,
  topTracks: [],
  recentlyPlayed: [],
  loading: true,
  error: null,
}

const SpotifyDashboardContext = createContext<DashboardState | null>(null)

type ProviderProps = {
  children: ReactNode
  topLimit?: number
  recentLimit?: number
}

export function SpotifyDashboardProvider({
  children,
  topLimit = 4,
  recentLimit = 6,
}: ProviderProps) {
  const [state, setState] = useState<DashboardState>(empty)

  useEffect(() => {
    let cancelled = false

    async function load(isInitial: boolean) {
      if (isInitial) {
        setState((prev) => ({ ...prev, loading: true }))
      }
      try {
        const data: DashboardData = await fetchDashboard({
          topLimit,
          recentLimit,
          topRange: 'medium_term',
        })
        if (cancelled) return
        setState({
          profile: data.profile,
          lastListened: data.lastListened,
          topTracks: data.topTracks,
          recentlyPlayed: data.recentlyPlayed,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unable to load',
        }))
      }
    }

    void load(true)
    const id = window.setInterval(() => {
      void load(false)
    }, POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [topLimit, recentLimit])

  return (
    <SpotifyDashboardContext.Provider value={state}>
      {children}
    </SpotifyDashboardContext.Provider>
  )
}

export function useSpotifyDashboard(): DashboardState {
  const ctx = useContext(SpotifyDashboardContext)
  if (!ctx) {
    throw new Error('useSpotifyDashboard must be used within SpotifyDashboardProvider')
  }
  return ctx
}
