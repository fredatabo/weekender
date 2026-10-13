# Weekender

Search a city and date range for concerts, sports and shows, see the forecast for each event day, and save events to a Going list.

## Run it
1. Get a free key at https://developer.ticketmaster.com
2. Open `js/config.js` and replace `YOUR_KEY_HERE` with your key.
3. The app uses ES modules, so it must be served, not opened as a file. In VS Code use the Live Server extension, or run `npm install` once, then `npm run server`.

`js/config.js` is in `.gitignore` so your key stays out of GitHub. Share `config.example.js` instead.

## APIs
- Nominatim (OpenStreetMap) for geocoding
- Ticketmaster Discovery API for events
- Open-Meteo for the daily forecast
