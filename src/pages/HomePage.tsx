import { GardenStage } from '@/components/GardenStage'
import { GlassNowPlaying } from '@/components/GlassNowPlaying'
import { RecentlyPlayed } from '@/components/RecentlyPlayed'
import { SiteHero } from '@/components/SiteHero'
import { SitePlaceholders } from '@/components/SitePlaceholders'
import { TopTracks } from '@/components/TopTracks'
import { SpotifyDashboardProvider } from '@/hooks/SpotifyDashboardProvider'
import { useLastListened } from '@/hooks/useLastListened'

/**
 * Fixed garden + rain on the sides; music column scrolls on top.
 * Spotify data comes from a single /auto/dashboard request.
 */
export function HomePage() {
  return (
    <SpotifyDashboardProvider topLimit={4} recentLimit={6}>
      <HomePageInner />
    </SpotifyDashboardProvider>
  )
}

function HomePageInner() {
  const lastListened = useLastListened()

  return (
    <div className="relative min-h-[100svh] w-full bg-[#090910] text-foreground">
      <GardenStage
        overlay={
          <>
            <SiteHero />

            <main className="mb-8 flex flex-1 flex-col gap-12">
              <SitePlaceholders />
              <TopTracks limit={4} />
              <RecentlyPlayed nowPlayingId={lastListened.track?.id} limit={6} />
            </main>

            <footer className="mt-auto shrink-0 pt-4 pb-6">
              <GlassNowPlaying state={lastListened} />
            </footer>
          </>
        }
      />
    </div>
  )
}
