import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchDashboard,
  fetchPlaying,
  type LastListenedTrack,
  type RecentlyPlayedItem,
  type SpotifyProfile,
  type TrackSummary,
} from '@/lib/api'

/** Poll real-time /auto/playing after initial dashboard load */
const PLAYING_POLL_MS = 30_000

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

  // 1) Page load: one dashboard fetch for me / top / recent / initial playing
  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const data = await fetchDashboard({
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

    void loadDashboard()
    return () => {
      cancelled = true
    }
  }, [topLimit, recentLimit])

  // 2) After init: poll /auto/playing every 30s for live track + progress
  useEffect(() => {
    if (state.loading) return

    let cancelled = false

    async function pollPlaying() {
      try {
        const live = await fetchPlaying()
        if (cancelled) return
        setState((prev) => {
          if (live) {
            return { ...prev, lastListened: live, error: null }
          }
          // Nothing playing — keep last track, clear live flags
          if (!prev.lastListened) return prev
          return {
            ...prev,
            lastListened: {
              ...prev.lastListened,
              isPlaying: false,
              progressMs: null,
            },
            error: null,
          }
        })
      } catch {
        // Keep dashboard data if playing poll fails
      }
    }

    const id = window.setInterval(() => {
      void pollPlaying()
    }, PLAYING_POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [state.loading])

  return (
    <SpotifyDashboardContext.Provider value={state}>
      {children}
    </SpotifyDashboardContext.Provider>
  )
}

export function useSpotifyDashboard(): DashboardState {
  const ctx = useContext(SpotifyDashboardContext)
  if (!ctx) {
    throw new Error(
      'useSpotifyDashboard must be used within SpotifyDashboardProvider',
    )
  }
  return ctx
}
