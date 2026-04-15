/**
 * WeatherApp — app.js
 * Uses Open-Meteo (https://open-meteo.com/) — no API key required.
 * Geocoding: https://geocoding-api.open-meteo.com/v1/search
 * Weather:   https://api.open-meteo.com/v1/forecast
 */

// ── Theme toggle ────────────────────────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem("weatherapp-theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
  }
  // If no preference saved, default is dark (no data-theme attribute needed)
})();

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("weatherapp-theme", next);
});

// ── WMO weather-code map ────────────────────────────────────────────────────
const WMO_CODES = {
  0:  { label: "Céu Limpo",                  emoji: "☀️" },
  1:  { label: "Principalmente Limpo",        emoji: "🌤️" },
  2:  { label: "Parcialmente Nublado",        emoji: "⛅" },
  3:  { label: "Encoberto",                   emoji: "☁️" },
  45: { label: "Nevoeiro",                    emoji: "🌫️" },
  48: { label: "Nevoeiro com Geada",          emoji: "🌫️" },
  51: { label: "Garoa Fraca",                 emoji: "🌦️" },
  53: { label: "Garoa Moderada",              emoji: "🌦️" },
  55: { label: "Garoa Intensa",               emoji: "🌧️" },
  61: { label: "Chuva Fraca",                 emoji: "🌧️" },
  63: { label: "Chuva Moderada",              emoji: "🌧️" },
  65: { label: "Chuva Forte",                 emoji: "🌧️" },
  71: { label: "Neve Fraca",                  emoji: "🌨️" },
  73: { label: "Neve Moderada",               emoji: "🌨️" },
  75: { label: "Neve Intensa",                emoji: "❄️" },
  77: { label: "Grãos de Neve",               emoji: "🌨️" },
  80: { label: "Pancadas Fracas",             emoji: "🌦️" },
  81: { label: "Pancadas Moderadas",          emoji: "🌧️" },
  82: { label: "Pancadas Violentas",          emoji: "⛈️" },
  85: { label: "Pancadas de Neve Fracas",     emoji: "🌨️" },
  86: { label: "Pancadas de Neve Intensas",   emoji: "❄️" },
  95: { label: "Tempestade",                  emoji: "⛈️" },
  96: { label: "Tempestade com Granizo",      emoji: "⛈️" },
  99: { label: "Tempestade com Granizo Forte", emoji: "⛈️" },
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
const forecastList       = document.getElementById("forecastList");

const btnC = document.getElementById("btnC");
const btnF = document.getElementById("btnF");

// ── State ────────────────────────────────────────────────────────────────────
let currentTempC    = null;  // always stored in °C
let feelsLikeTempC  = null;
let currentUnit     = "C";
let forecastDays    = [];    // array of { dateStr, maxC, minC, code }

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

  // refresh forecast temperatures
  if (forecastDays.length > 0) {
    renderForecast(forecastDays);
  }

  btnC.classList.toggle("active", unit === "C");
  btnF.classList.toggle("active", unit === "F");
}

btnC.addEventListener("click", () => applyUnit("C"));
btnF.addEventListener("click", () => applyUnit("F"));

// ── API calls ────────────────────────────────────────────────────────────────
async function geocode(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Falha na requisição de geocodificação.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Cidade "${cityName}" não encontrada. Verifique a grafia.`);
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
    daily:                 [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
    ].join(","),
    wind_speed_unit: "kmh",
    timezone:        "auto",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Falha ao obter os dados do clima.");
  return res.json();
}

// ── Forecast render ──────────────────────────────────────────────────────────
function renderForecast(days) {
  forecastDays = days;
  forecastList.innerHTML = "";

  days.forEach(({ dateStr, maxC, minC, code }) => {
    const wmo  = WMO_CODES[code] || { label: "–", emoji: "🌡️" };
    const date = new Date(dateStr + "T12:00:00"); // noon to avoid timezone date shifts
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });

    const item = document.createElement("div");
    item.className = "forecast-item";
    item.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-icon" aria-hidden="true">${wmo.emoji}</span>
      <span class="forecast-temps">
        <span class="forecast-max">${formatTemp(maxC, currentUnit)}</span>
        <span class="forecast-min">${formatTemp(minC, currentUnit)}</span>
      </span>`;
    forecastList.appendChild(item);
  });
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderWeather(location, weather) {
  const cur  = weather.current;
  const code = cur.weather_code;
  const wmo  = WMO_CODES[code] || { label: "Desconhecido", emoji: "🌡️" };

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
  detailWind.textContent        = `${Math.round(cur.wind_speed_10m)} km/h`;

  const visKm = cur.visibility != null
    ? `${(cur.visibility / 1000).toFixed(1)} km`
    : "N/A";
  detailVisibility.textContent = visKm;

  // build daily forecast array (skip index 0 = today)
  const daily = weather.daily;
  if (daily && daily.time && daily.time.length > 1) {
    const days = daily.time.slice(1).map((dateStr, i) => ({
      dateStr,
      maxC: daily.temperature_2m_max[i + 1],
      minC: daily.temperature_2m_min[i + 1],
      code: daily.weather_code[i + 1],
    }));
    renderForecast(days);
  } else {
    forecastDays = [];
    forecastList.innerHTML = "";
  }

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
    showError(err.message || "Algo deu errado. Por favor, tente novamente.");
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch(searchInput.value);
});
