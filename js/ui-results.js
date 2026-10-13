// Event cards and the weather strip.
import { isGoing } from './storage.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const formatDate = (d) =>
  d ? new Date(d + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date to be announced';

export function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${Number(h) % 12 || 12}:${m} ${Number(h) >= 12 ? 'PM' : 'AM'}`;
}

export function weatherStrip(w) {
  if (!w) return '<div class="weather weather--none">Forecast not available for this date yet</div>';
  return `<div class="weather">
    <span class="weather__icon" aria-hidden="true">${w.icon}</span>
    <span>${esc(w.label)}</span>
    <span>${w.max}° / ${w.min}°C</span>
    <span>Rain ${w.rain}%</span>
  </div>`;
}

export function cardHTML(ev) {
  const going = isGoing(ev.id);
  const img = ev.image
    ? `<img src="${esc(ev.image)}" alt="" loading="lazy">`
    : '<div class="card__noimg" aria-hidden="true"></div>';
  return `<article class="card">
    ${img}
    <div class="card__body">
      <h3>${esc(ev.name)}</h3>
      <p class="meta">${formatDate(ev.date)} ${formatTime(ev.time)}</p>
      <p class="meta">${esc(ev.venue)}${ev.city ? ', ' + esc(ev.city) : ''}</p>
      ${ev.price ? `<p class="meta">${esc(ev.price)}</p>` : ''}
    </div>
    ${weatherStrip(ev.weather)}
    <div class="card__actions">
      <button class="btn ${going ? 'btn--saved' : 'btn--going'}" data-going="${esc(ev.id)}" aria-pressed="${going}">
        ${going ? 'Going' : 'Add to Going'}
      </button>
      <a class="btn btn--ghost" href="${esc(ev.url)}" target="_blank" rel="noopener">Tickets</a>
    </div>
  </article>`;
}

export function renderResults(el, events) {
  el.innerHTML = events.map(cardHTML).join('');
}
