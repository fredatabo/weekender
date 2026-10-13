// Ticketmaster Discovery API: events near a point within a date range.
import { TICKETMASTER_KEY, RADIUS_MILES } from './config.js';

export async function fetchEvents({ lat, lon, start, end }) {
  const params = new URLSearchParams({
    apikey: TICKETMASTER_KEY,
    latlong: `${lat},${lon}`,
    radius: RADIUS_MILES,
    unit: 'miles',
    startDateTime: `${start}T00:00:00Z`,
    endDateTime: `${end}T23:59:59Z`,
    size: 50,
    sort: 'date,asc',
  });

  const res = await fetch('https://app.ticketmaster.com/discovery/v2/events.json?' + params);
  if (res.status === 401) throw new Error('Ticketmaster key is missing or wrong. Check js/config.js.');
  if (res.status === 429) throw new Error('Too many requests. Wait a few seconds and try again.');
  if (!res.ok) throw new Error('Could not load events right now.');

  const data = await res.json();
  const raw = data._embedded?.events ?? [];
  return raw.map(cleanEvent);
}

// Turn the big API object into the small one the app uses.
function cleanEvent(e) {
  const venue = e._embedded?.venues?.[0];
  const price = e.priceRanges?.[0];
  const image = (e.images ?? [])
    .filter((i) => i.width >= 300)
    .sort((a, b) => a.width - b.width)[0]?.url ?? null;

  return {
    id: e.id,
    name: e.name,
    date: e.dates?.start?.localDate ?? null,
    time: e.dates?.start?.localTime ?? null,
    venue: venue?.name ?? 'Venue to be announced',
    city: venue?.city?.name ?? '',
    image,
    url: e.url,
    category: e.classifications?.[0]?.segment?.name ?? 'Other',
    price: price ? `${Math.round(price.min)}-${Math.round(price.max)} ${price.currency}` : null,
    weather: null,
  };
}

// UI filter button -> Ticketmaster segment name
export const CATEGORY_MAP = {
  concerts: 'Music',
  sports: 'Sports',
  shows: 'Arts & Theatre',
};
