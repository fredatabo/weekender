// Nominatim: city name -> list of matching places with coordinates.
import { getGeoCache, setGeoCache } from './storage.js';

export async function geocode(city) {
  const key = city.trim().toLowerCase();
  const cache = getGeoCache();
  if (cache[key]) return cache[key];

  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' +
    encodeURIComponent(city);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not look up that city. Try again in a moment.');

  const data = await res.json();
  const places = data.map((p) => ({
    name: p.display_name,
    lat: Number(p.lat),
    lon: Number(p.lon),
  }));

  if (places.length) {
    cache[key] = places;
    setGeoCache(cache);
  }
  return places; // empty array = city not found
}
