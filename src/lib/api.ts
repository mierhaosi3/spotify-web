const API_BASE = '/api/v1'

export type SpotifyImage = {
  url: string
  height: number | null
  width: number | null
}

export type SpotifyArtist = {
  id?: string
  name: string
}

export type SpotifyTrack = {
  id: string
  name: string
  duration_ms: number
  artists: SpotifyArtist[]
  album: {
    id?: string
    name: string
    images: SpotifyImage[]
  }
  external_urls: {
    spotify: string
  }
}

export type SpotifyMe = {
  id: string
  display_name: string
  email?: string
  product?: string
  images: SpotifyImage[]
  external_urls: {
    spotify: string
  }
}

export type PlayingResponse = {
  is_playing?: boolean
  playing?: boolean
  progress_ms?: number
  item: SpotifyTrack | null
}

export type RecentlyPlayedResponse = {
  items: Array<{
    track: SpotifyTrack
    played_at: string
  }>
  next?: string | null
}

export type TopTracksResponse = {
  items: SpotifyTrack[]
  total?: number
  limit?: number
  offset?: number
}

export type DashboardResponse = {
  version?: string
  me: SpotifyMe
  playing: PlayingResponse
  top_tracks: TopTracksResponse
  recently_played: RecentlyPlayedResponse
}

export type TrackSummary = {
  id: string
  name: string
  artists: string
  albumArtUrl: string | null
  spotifyUrl: string
}

export type LastListenedTrack = TrackSummary & {
  isPlaying: boolean
  playedAt: string | null
  progressMs?: number | null
  durationMs?: number | null
}

export type RecentlyPlayedItem = TrackSummary & {
  playedAt: string
}

export type SpotifyProfile = {
  id: string
  displayName: string
  avatarUrl: string | null
  spotifyUrl: string
}

export type DashboardData = {
  profile: SpotifyProfile | null
  lastListened: LastListenedTrack | null
  topTracks: TrackSummary[]
  recentlyPlayed: RecentlyPlayedItem[]
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${res.status})`
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

export function getDashboard(opts?: {
  topLimit?: number
  topRange?: 'short_term' | 'medium_term' | 'long_term'
  recentLimit?: number
}) {
  const topLimit = opts?.topLimit ?? 4
  const topRange = opts?.topRange ?? 'medium_term'
  const recentLimit = opts?.recentLimit ?? 6
  const qs = new URLSearchParams({
    top_limit: String(topLimit),
    top_range: topRange,
    recent_limit: String(recentLimit),
  })
  return apiFetch<DashboardResponse>(`/spotify/auto/dashboard?${qs}`)
}

/** Real-time now-playing — no server cache; poll this after dashboard init */
export function getPlaying() {
  return apiFetch<PlayingResponse>('/spotify/auto/playing')
}

export function pickAlbumArt(
  images: SpotifyImage[] | undefined,
): string | null {
  if (!images?.length) return null
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  return (
    sorted.find((img) => (img.width ?? 0) >= 64)?.url ?? sorted[0]?.url ?? null
  )
}

export function toTrackSummary(track: SpotifyTrack): TrackSummary {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name).join(', '),
    albumArtUrl: pickAlbumArt(track.album.images),
    spotifyUrl: track.external_urls.spotify,
  }
}

function toLastListened(
  track: SpotifyTrack,
  opts: {
    isPlaying: boolean
    playedAt: string | null
    progressMs?: number | null
  },
): LastListenedTrack {
  return {
    ...toTrackSummary(track),
    isPlaying: opts.isPlaying,
    playedAt: opts.playedAt,
    progressMs: opts.progressMs ?? null,
    durationMs: track.duration_ms ?? null,
  }
}

/** Map /auto/playing into last-listened; null item means nothing playing */
export function mapPlaying(
  playing: PlayingResponse,
): LastListenedTrack | null {
  if (!playing?.item) return null
  const isPlaying = Boolean(playing.is_playing ?? playing.playing)
  return toLastListened(playing.item, {
    isPlaying,
    playedAt: null,
    progressMs: playing.progress_ms ?? null,
  })
}

export async function fetchPlaying(): Promise<LastListenedTrack | null> {
  return mapPlaying(await getPlaying())
}

function toProfile(me: SpotifyMe): SpotifyProfile {
  return {
    id: me.id,
    displayName: me.display_name,
    avatarUrl: pickAlbumArt(me.images),
    spotifyUrl: me.external_urls.spotify,
  }
}

export function mapDashboard(raw: DashboardResponse): DashboardData {
  const playing = raw.playing
  const hasItem = Boolean(playing?.item)
  const isPlaying = Boolean(playing?.is_playing ?? playing?.playing)

  let lastListened: LastListenedTrack | null = null
  if (hasItem && playing.item) {
    lastListened = toLastListened(playing.item, {
      isPlaying,
      playedAt: null,
      progressMs: playing.progress_ms ?? null,
    })
  } else {
    const first = raw.recently_played?.items?.[0]
    if (first?.track) {
      lastListened = toLastListened(first.track, {
        isPlaying: false,
        playedAt: first.played_at,
      })
    }
  }

  return {
    profile: raw.me ? toProfile(raw.me) : null,
    lastListened,
    topTracks: (raw.top_tracks?.items ?? []).map(toTrackSummary),
    recentlyPlayed: (raw.recently_played?.items ?? [])
      .filter((item) => item.track)
      .map((item) => ({
        ...toTrackSummary(item.track),
        playedAt: item.played_at,
      })),
  }
}

export async function fetchDashboard(opts?: {
  topLimit?: number
  topRange?: 'short_term' | 'medium_term' | 'long_term'
  recentLimit?: number
}): Promise<DashboardData> {
  return mapDashboard(await getDashboard(opts))
}
