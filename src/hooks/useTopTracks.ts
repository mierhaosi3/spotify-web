import { useEffect, useState } from 'react'
import { fetchTopTracks, type TrackSummary } from '@/lib/api'

type State = {
  tracks: TrackSummary[]
  loading: boolean
  error: string | null
}

export function useTopTracks(limit = 4): State {
  const [tracks, setTracks] = useState<TrackSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const next = await fetchTopTracks('medium_term', limit)
        if (cancelled) return
        setTracks(next)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unable to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [limit])

  return { tracks, loading, error }
}
