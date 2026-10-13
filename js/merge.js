// Attach the right day's forecast to each event.
export function mergeWeather(events, weatherByDate) {
  return events.map((e) => ({ ...e, weather: weatherByDate[e.date] ?? null }));
}
