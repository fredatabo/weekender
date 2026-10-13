// Open-Meteo: one request returns the daily forecast for the whole range.
const CODES = {
  0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
  45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'],
  51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'],
  61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
  71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'], 75: ['❄️', 'Heavy snow'],
  80: ['🌦️', 'Showers'], 81: ['🌧️', 'Showers'], 82: ['⛈️', 'Heavy showers'],
  95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm'], 99: ['⛈️', 'Thunderstorm'],
};

// Returns { 'YYYY-MM-DD': { icon, label, max, min, rain } }.
// If the forecast fails, returns {} so events still show without weather.
export async function fetchWeather({ lat, lon, start, end }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    start_date: start,
    end_date: end,
  });

  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
    if (!res.ok) return {};
    const { daily } = await res.json();

    const byDate = {};
    daily.time.forEach((date, i) => {
      const [icon, label] = CODES[daily.weather_code[i]] ?? ['🌡️', 'Unknown'];
      byDate[date] = {
        icon,
        label,
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
        rain: daily.precipitation_probability_max[i] ?? 0,
      };
    });
    return byDate;
  } catch {
    return {};
  }
}
