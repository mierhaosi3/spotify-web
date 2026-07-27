import { GardenStage } from '@/components/GardenStage'
import { GlassNowPlaying } from '@/components/GlassNowPlaying'
import { RecentlyPlayed } from '@/components/RecentlyPlayed'
import { SiteContent } from '@/components/SiteContent'
import { SiteHero } from '@/components/SiteHero'
import { TopTracks } from '@/components/TopTracks'
import { SpotifyDashboardProvider } from '@/hooks/SpotifyDashboardProvider'
import { useLastListened } from '@/hooks/useLastListened'

/**
 * Fixed garden + weather atmosphere; music column scrolls on top.
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
    <div className="relative min-h-[100svh] w-full bg-background text-foreground">
      <GardenStage
        overlay={
          <>
            <SiteHero />

            <main className="mb-8 flex flex-1 flex-col gap-12">
              <SiteContent />
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
