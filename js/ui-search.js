// Search form: dates, validation, "This weekend", and the city picker.
import { MAX_RANGE_DAYS } from './config.js';

const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function thisWeekend() {
  const today = new Date();
  const dow = today.getDay(); // 0 Sun ... 6 Sat
  const start = new Date(today);
  const end = new Date(today);
  if (dow === 0) {
    // Sunday: just today
  } else if (dow === 6) {
    end.setDate(today.getDate() + 1);
  } else {
    start.setDate(today.getDate() + (5 - dow));
    end.setDate(start.getDate() + 2);
  }
  return { start: iso(start), end: iso(end) };
}

// Returns an error message, or '' if the form is fine.
export function validate({ city, start, end }) {
  if (!city.trim()) return 'Enter a city.';
  if (!start || !end) return 'Pick a start and end date.';
  if (end < start) return 'The end date has to be on or after the start date.';
  const days = (new Date(end) - new Date(start)) / 86400000 + 1;
  if (days > MAX_RANGE_DAYS) return `Pick a range of ${MAX_RANGE_DAYS} days or fewer.`;
  return '';
}

export function showPlacePicker(el, places, onPick) {
  el.innerHTML = '<p>Which one did you mean?</p>';
  places.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'place';
    b.textContent = p.name;
    b.addEventListener('click', () => {
      el.hidden = true;
      onPick(p);
    });
    el.appendChild(b);
  });
  el.hidden = false;
}
