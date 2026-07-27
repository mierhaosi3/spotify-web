const API_BASE = '/api/v1'

/** Normalized moods used by AtmosphereLayer */
export type WeatherMood = 'clear' | 'cloud' | 'rain' | 'snow' | 'fog'

export type WeatherResponse = {
  mood: string
  is_day: boolean
  temperature_c: number | null
  weather_code: number
  updated_at: string
}

export type WeatherState = {
  mood: WeatherMood
  isDay: boolean
  temperatureC: number | null
  weatherCode: number | null
  updatedAt: string | null
}

/** Map d-api moods → site FX moods */
export function normalizeMood(raw: string): WeatherMood {
  switch (raw) {
    case 'sunny':
    case 'clear':
      return 'clear'
    case 'cloudy':
    case 'cloud':
      return 'cloud'
    case 'drizzle':
    case 'rain':
    case 'shower':
    case 'thunder':
      return 'rain'
    case 'snow':
      return 'snow'
    case 'fog':
      return 'fog'
    default:
      return 'cloud'
  }
}

function fallbackWeather(): WeatherState {
  const hour = new Date().getHours()
  return {
    mood: 'cloud',
    isDay: hour >= 6 && hour < 19,
    temperatureC: null,
    weatherCode: null,
    updatedAt: null,
  }
}

export async function getWeather(): Promise<WeatherState> {
  try {
    const res = await fetch(`${API_BASE}/weather`)
    if (!res.ok) return fallbackWeather()
    const data = (await res.json()) as WeatherResponse
    return {
      mood: normalizeMood(data.mood),
      isDay: Boolean(data.is_day),
      temperatureC:
        typeof data.temperature_c === 'number' ? data.temperature_c : null,
      weatherCode:
        typeof data.weather_code === 'number' ? data.weather_code : null,
      updatedAt: data.updated_at ?? null,
    }
  } catch {
    return fallbackWeather()
  }
}
