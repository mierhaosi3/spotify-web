import { useEffect, useState } from 'react'
import { getWeather, type WeatherState } from '@/lib/weather'

const REFRESH_MS = 15 * 60 * 1000

const initial: WeatherState = {
  mood: 'cloud',
  isDay: true,
  temperatureC: null,
  weatherCode: null,
  updatedAt: null,
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherState>(initial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const next = await getWeather()
      if (cancelled) return
      setWeather(next)
      setLoading(false)
    }

    void load()
    const id = window.setInterval(() => {
      void load()
    }, REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return { weather, loading }
}
