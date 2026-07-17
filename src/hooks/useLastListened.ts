import { useEffect, useState } from 'react'
import { fetchLastListened, type LastListenedTrack } from '@/lib/api'

const POLL_MS = 10_000

type LastListenedState = {
  track: LastListenedTrack | null
  loading: boolean
  error: string | null
}

export function useLastListened(): LastListenedState {
  const [track, setTrack] = useState<LastListenedTrack | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load(isInitial: boolean) {
      if (isInitial) setLoading(true)
      try {
        const next = await fetchLastListened()
        if (cancelled) return
        setTrack(next)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unable to load')
      } finally {
        if (!cancelled && isInitial) setLoading(false)
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
  }, [])

  return { track, loading, error }
}
