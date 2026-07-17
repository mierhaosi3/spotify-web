import { useEffect, useState } from 'react'
import { getMe, pickAlbumArt, type SpotifyMe } from '@/lib/api'

export type SpotifyProfile = {
  id: string
  displayName: string
  avatarUrl: string | null
  spotifyUrl: string
}

type State = {
  profile: SpotifyProfile | null
  loading: boolean
  error: string | null
}

function toProfile(me: SpotifyMe): SpotifyProfile {
  return {
    id: me.id,
    displayName: me.display_name,
    avatarUrl: pickAlbumArt(me.images),
    spotifyUrl: me.external_urls.spotify,
  }
}

export function useSpotifyMe(): State {
  const [profile, setProfile] = useState<SpotifyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const me = await getMe()
        if (cancelled) return
        setProfile(toProfile(me))
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
  }, [])

  return { profile, loading, error }
}
