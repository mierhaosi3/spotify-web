import { siteConfig } from '@/config/site'
import { useSpotifyMe } from '@/hooks/useSpotifyMe'

/** Main-branch hero: avatar + name + title (for the floating music column) */
export function SiteHero() {
  const { profile, loading } = useSpotifyMe()
  const name = profile?.displayName || siteConfig.name

  return (
    <header className="mb-10 flex flex-col gap-3 sm:mb-12">
      <div className="flex items-center gap-3">
        {loading && !profile ? (
          <div className="size-12 shrink-0 animate-pulse rounded-full bg-white/10" />
        ) : profile?.avatarUrl ? (
          <a
            href={profile.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-12 rounded-full object-cover ring-1 ring-white/15"
            />
          </a>
        ) : null}

        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {name}
          </h1>
          <p className="truncate text-[12px] text-muted-foreground">
            {siteConfig.title}
          </p>
        </div>
      </div>
    </header>
  )
}
