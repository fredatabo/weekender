// Starts the app and connects the modules.
import { geocode } from './geocode.js';
import { fetchEvents, CATEGORY_MAP } from './events.js';
import { fetchWeather } from './weather.js';
import { mergeWeather } from './merge.js';
import { addGoing, removeGoing, clearGoing, getGoing, getLastSearch, setLastSearch } from './storage.js';
import { thisWeekend, validate, showPlacePicker } from './ui-search.js';
import { renderResults } from './ui-results.js';
import { renderGoing } from './ui-going.js';

const $ = (id) => document.getElementById(id);
const state = { events: [], category: 'all' };

/* ---------- views ---------- */
function showView(name) {
  $('view-search').hidden = name !== 'search';
  $('view-going').hidden = name !== 'going';
  $('nav-search').classList.toggle('is-active', name === 'search');
  $('nav-going').classList.toggle('is-active', name === 'going');
  if (name === 'going') renderGoing($('going-list'));
}
const updateCount = () => { $('going-count').textContent = getGoing().length; };

/* ---------- status messages ---------- */
function setStatus(html) { $('status').innerHTML = html; }
function showError(msg, retry) {
  setStatus(`<p class="error">${msg} ${retry ? '<button id="retry" class="btn btn--ghost">Try again</button>' : ''}</p>`);
  if (retry) $('retry').addEventListener('click', retry);
}

/* ---------- search flow ---------- */
function visibleEvents() {
  if (state.category === 'all') return state.events;
  return state.events.filter((e) => e.category === CATEGORY_MAP[state.category]);
}

function draw() {
  const list = visibleEvents();
  renderResults($('results'), list);
  if (!state.events.length) return;
  setStatus(list.length ? '' :
    '<p class="empty">No events in this category. Try All, or widen your dates.</p>');
}

async function runSearch(place, start, end) {
  setStatus('<p class="loading">Finding events and checking the forecast...</p>');
  $('results').innerHTML = '';
  try {
    const [events, weather] = await Promise.all([
      fetchEvents({ lat: place.lat, lon: place.lon, start, end }),
      fetchWeather({ lat: place.lat, lon: place.lon, start, end }),
    ]);
    state.events = mergeWeather(events, weather);
    $('filters').hidden = false;
    if (!state.events.length) {
      setStatus('<p class="empty">No events found for those dates. Try a wider date range or a bigger city.</p>');
      return;
    }
    draw();
  } catch (err) {
    showError(err.message, () => runSearch(place, start, end));
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const form = { city: $('city').value, start: $('start').value, end: $('end').value };
  const problem = validate(form);
  $('form-error').hidden = !problem;
  $('form-error').textContent = problem;
  if (problem) return;

  $('place-picker').hidden = true;
  setStatus('<p class="loading">Looking up the city...</p>');
  try {
    const places = await geocode(form.city);
    if (!places.length) {
      setStatus(`<p class="error">We couldn't find "${form.city.trim()}". Check the spelling or add the country.</p>`);
      return;
    }
    setLastSearch(form);
    const go = (p) => runSearch(p, form.start, form.end);
    if (places.length === 1) go(places[0]);
    else {
      setStatus('');
      showPlacePicker($('place-picker'), places, go);
    }
  } catch (err) {
    showError(err.message, () => $('search-form').requestSubmit());
  }
}

/* ---------- wiring ---------- */
$('search-form').addEventListener('submit', onSubmit);

$('weekend-btn').addEventListener('click', () => {
  const { start, end } = thisWeekend();
  $('start').value = start;
  $('end').value = end;
});

$('filters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  state.category = btn.dataset.cat;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === btn));
  draw();
});

$('results').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-going]');
  if (!btn) return;
  const ev = state.events.find((x) => x.id === btn.dataset.going);
  if (!ev) return;
  if (btn.getAttribute('aria-pressed') === 'true') removeGoing(ev.id);
  else addGoing(ev);
  updateCount();
  draw();
});

$('going-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  removeGoing(btn.dataset.remove);
  updateCount();
  renderGoing($('going-list'));
});

$('clear-going').addEventListener('click', () => {
  if (!getGoing().length) return;
  if (confirm('Remove every event from your Going list?')) {
    clearGoing();
    updateCount();
    renderGoing($('going-list'));
  }
});

$('nav-search').addEventListener('click', () => showView('search'));
$('nav-going').addEventListener('click', () => showView('going'));

/* ---------- start ---------- */
const last = getLastSearch();
if (last) {
  $('city').value = last.city;
  $('start').value = last.start;
  $('end').value = last.end;
}
updateCount();
