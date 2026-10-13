// All localStorage reads and writes live here.
const GOING = 'going';
const LAST = 'lastSearch';
const GEO = 'geoCache';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app still works, it just won't remember */
  }
}

export const getGoing = () => load(GOING, []);
export const isGoing = (id) => getGoing().some((e) => e.id === id);

export function addGoing(event) {
  const list = getGoing();
  if (list.some((e) => e.id === event.id)) return list; // no duplicates
  list.push(event);
  save(GOING, list);
  return list;
}

export function removeGoing(id) {
  const list = getGoing().filter((e) => e.id !== id);
  save(GOING, list);
  return list;
}

export const clearGoing = () => save(GOING, []);

export const getLastSearch = () => load(LAST, null);
export const setLastSearch = (s) => save(LAST, s);

export const getGeoCache = () => load(GEO, {});
export const setGeoCache = (c) => save(GEO, c);
