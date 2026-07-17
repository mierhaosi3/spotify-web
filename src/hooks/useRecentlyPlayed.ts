import { useEffect, useState } from 'react'
import { fetchRecentlyPlayedList, type RecentlyPlayedItem } from '@/lib/api'

type State = {
  items: RecentlyPlayedItem[]
  loading: boolean
  error: string | null
}

export function useRecentlyPlayed(
  nowPlayingId?: string | null,
  limit = 4,
): State {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const next = await fetchRecentlyPlayedList(limit)
        if (cancelled) return
        setItems(next)
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
  }, [nowPlayingId, limit])

  return { items, loading, error }
}
