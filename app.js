/**
 * WeatherApp — app.js
 * Uses Open-Meteo (https://open-meteo.com/) — no API key required.
 * Geocoding: https://geocoding-api.open-meteo.com/v1/search
 * Weather:   https://api.open-meteo.com/v1/forecast
 */

// ── WMO weather-code map ────────────────────────────────────────────────────
const WMO_CODES = {
  0:  { label: "Clear Sky",           emoji: "☀️" },
  1:  { label: "Mainly Clear",        emoji: "🌤️" },
  2:  { label: "Partly Cloudy",       emoji: "⛅" },
  3:  { label: "Overcast",            emoji: "☁️" },
  45: { label: "Foggy",               emoji: "🌫️" },
  48: { label: "Icy Fog",             emoji: "🌫️" },
  51: { label: "Light Drizzle",       emoji: "🌦️" },
  53: { label: "Moderate Drizzle",    emoji: "🌦️" },
  55: { label: "Dense Drizzle",       emoji: "🌧️" },
  61: { label: "Slight Rain",         emoji: "🌧️" },
  63: { label: "Moderate Rain",       emoji: "🌧️" },
  65: { label: "Heavy Rain",          emoji: "🌧️" },
  71: { label: "Slight Snow",         emoji: "🌨️" },
  73: { label: "Moderate Snow",       emoji: "🌨️" },
  75: { label: "Heavy Snow",          emoji: "❄️" },
  77: { label: "Snow Grains",         emoji: "🌨️" },
  80: { label: "Slight Showers",      emoji: "🌦️" },
  81: { label: "Moderate Showers",    emoji: "🌧️" },
  82: { label: "Violent Showers",     emoji: "⛈️" },
  85: { label: "Slight Snow Showers", emoji: "🌨️" },
  86: { label: "Heavy Snow Showers",  emoji: "❄️" },
  95: { label: "Thunderstorm",        emoji: "⛈️" },
  96: { label: "Thunderstorm w/ Hail","emoji": "⛈️" },
  99: { label: "Thunderstorm w/ Heavy Hail", emoji: "⛈️" },
};

// ── DOM references ───────────────────────────────────────────────────────────
const searchForm       = document.getElementById("searchForm");
const searchInput      = document.getElementById("searchInput");
const weatherCard      = document.getElementById("weatherCard");
const loadingSpinner   = document.getElementById("loadingSpinner");
const placeholder      = document.getElementById("placeholder");
const errorMessage     = document.getElementById("errorMessage");

const weatherCity        = document.getElementById("weatherCity");
const weatherCountry     = document.getElementById("weatherCountry");
const weatherIcon        = document.getElementById("weatherIcon");
const tempValue          = document.getElementById("tempValue");
const weatherDescription = document.getElementById("weatherDescription");
const detailHumidity     = document.getElementById("detailHumidity");
const detailWind         = document.getElementById("detailWind");
const detailFeelsLike    = document.getElementById("detailFeelsLike");
const detailVisibility   = document.getElementById("detailVisibility");

const btnC = document.getElementById("btnC");
const btnF = document.getElementById("btnF");

// ── State ────────────────────────────────────────────────────────────────────
let currentTempC    = null;  // always stored in °C
let feelsLikeTempC  = null;
let currentUnit     = "C";

// ── Helpers ──────────────────────────────────────────────────────────────────
function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(c, unit) {
  const val = unit === "C" ? c : cToF(c);
  return `${Math.round(val)}°${unit}`;
}

function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }

function setLoading(on) {
  if (on) {
    hide(weatherCard);
    hide(errorMessage);
    hide(placeholder);
    show(loadingSpinner);
  } else {
    hide(loadingSpinner);
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  show(errorMessage);
  hide(weatherCard);
}

// ── Temperature unit toggle ──────────────────────────────────────────────────
function applyUnit(unit) {
  currentUnit = unit;

  if (currentTempC !== null) {
    tempValue.textContent = formatTemp(currentTempC, unit);
  }
  if (feelsLikeTempC !== null) {
    detailFeelsLike.textContent = formatTemp(feelsLikeTempC, unit);
  }

  btnC.classList.toggle("active", unit === "C");
  btnF.classList.toggle("active", unit === "F");
}

btnC.addEventListener("click", () => applyUnit("C"));
btnF.addEventListener("click", () => applyUnit("F"));

// ── API calls ────────────────────────────────────────────────────────────────
async function geocode(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Please check the spelling.`);
  }
  return data.results[0];
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude:              lat,
    longitude:             lon,
    current:               [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "visibility",
    ].join(","),
    wind_speed_unit: "mph",
    timezone:        "auto",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Weather data request failed.");
  return res.json();
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderWeather(location, weather) {
  const cur  = weather.current;
  const code = cur.weather_code;
  const wmo  = WMO_CODES[code] || { label: "Unknown", emoji: "🌡️" };

  // store temps in Celsius for later unit switching
  currentTempC   = cur.temperature_2m;
  feelsLikeTempC = cur.apparent_temperature;

  weatherCity.textContent    = location.name;
  weatherCountry.textContent = [location.admin1, location.country_code]
    .filter(Boolean)
    .join(", ");

  weatherIcon.textContent        = wmo.emoji;
  weatherDescription.textContent = wmo.label;

  // apply current unit preference
  tempValue.textContent         = formatTemp(currentTempC, currentUnit);
  detailFeelsLike.textContent   = formatTemp(feelsLikeTempC, currentUnit);

  detailHumidity.textContent    = `${cur.relative_humidity_2m}%`;
  detailWind.textContent        = `${Math.round(cur.wind_speed_10m)} mph`;

  const visKm = cur.visibility != null
    ? `${(cur.visibility / 1000).toFixed(1)} km`
    : "N/A";
  detailVisibility.textContent = visKm;

  show(weatherCard);
}

// ── Search ───────────────────────────────────────────────────────────────────
async function handleSearch(query) {
  const city = query.trim();
  if (!city) return;

  setLoading(true);

  try {
    const location = await geocode(city);
    const weather  = await fetchWeather(location.latitude, location.longitude);
    setLoading(false);
    renderWeather(location, weather);
  } catch (err) {
    setLoading(false);
    showError(err.message || "Something went wrong. Please try again.");
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch(searchInput.value);
});
