import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { siteConfig } from '@/config/site'
import { useSpotifyMe } from '@/hooks/useSpotifyMe'
import { useWeather } from '@/hooks/useWeather'

/** Hero: avatar + name + theme lock + weather chip */
export function SiteHero() {
  const { profile, loading } = useSpotifyMe()
  const { weather } = useWeather()
  const name = profile?.displayName || siteConfig.name

  return (
    <header className="mb-10 flex flex-col gap-4 sm:mb-12">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {loading && !profile ? (
            <div className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
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
                className="size-12 rounded-full object-cover ring-1 ring-border"
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

        <ThemeToggle className="shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        <span>
          {weather.mood}
          {weather.isDay ? ' · day' : ' · night'}
          {weather.temperatureC != null
            ? ` · ${Math.round(weather.temperatureC)}°C`
            : ''}
        </span>
        <span className="text-border">/</span>
        <Link
          to="/resume"
          className="transition-colors hover:text-[rgba(253,107,148,0.95)]"
        >
          Resume →
        </Link>
        <Link
          to="/writing"
          className="transition-colors hover:text-[rgba(253,107,148,0.95)]"
        >
          Writing →
        </Link>
      </div>
    </header>
  )
}
