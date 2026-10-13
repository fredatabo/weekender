// The Going page.
import { getGoing } from './storage.js';
import { formatDate, formatTime, weatherStrip } from './ui-results.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderGoing(el) {
  const list = getGoing().sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  if (!list.length) {
    el.innerHTML = '<p class="empty">Nothing saved yet. Find an event and tap Add to Going.</p>';
    return;
  }
  el.innerHTML = list.map((ev) => `
    <article class="row">
      <div>
        <h3>${esc(ev.name)}</h3>
        <p class="meta">${formatDate(ev.date)} ${formatTime(ev.time)} at ${esc(ev.venue)}</p>
        ${weatherStrip(ev.weather)}
      </div>
      <div class="row__actions">
        <a class="btn btn--ghost" href="${esc(ev.url)}" target="_blank" rel="noopener">Tickets</a>
        <button class="btn btn--ghost" data-remove="${esc(ev.id)}">Remove</button>
      </div>
    </article>`).join('');
}
