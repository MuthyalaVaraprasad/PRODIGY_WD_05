// Weather API & UI Logic for Atmosphere App

// WMO Weather Codes mapping to description, icons, and body background classes
const WEATHER_CODES = {
    0: { label: 'Clear Sky', icon: 'sun', iconNight: 'moon', bg: 'weather-clear-day', bgNight: 'weather-clear-night' },
    1: { label: 'Mainly Clear', icon: 'cloud-sun', iconNight: 'cloud-moon', bg: 'weather-clear-day', bgNight: 'weather-clear-night' },
    2: { label: 'Partly Cloudy', icon: 'cloud-sun', iconNight: 'cloud-moon', bg: 'weather-cloudy-day', bgNight: 'weather-cloudy-night' },
    3: { label: 'Overcast', icon: 'cloud', iconNight: 'cloud', bg: 'weather-cloudy-day', bgNight: 'weather-cloudy-night' },
    45: { label: 'Foggy', icon: 'cloud-fog', iconNight: 'cloud-fog', bg: 'weather-foggy', bgNight: 'weather-foggy' },
    48: { label: 'Depositing Rime Fog', icon: 'cloud-fog', iconNight: 'cloud-fog', bg: 'weather-foggy', bgNight: 'weather-foggy' },
    51: { label: 'Light Drizzle', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    53: { label: 'Moderate Drizzle', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    55: { label: 'Heavy Drizzle', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    56: { label: 'Light Freezing Drizzle', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    57: { label: 'Dense Freezing Drizzle', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    61: { label: 'Slight Rain', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    63: { label: 'Moderate Rain', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    65: { label: 'Heavy Rain', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    66: { label: 'Light Freezing Rain', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    67: { label: 'Heavy Freezing Rain', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    71: { label: 'Slight Snowfall', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    73: { label: 'Moderate Snowfall', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    75: { label: 'Heavy Snowfall', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    77: { label: 'Snow Grains', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    80: { label: 'Slight Rain Showers', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    81: { label: 'Moderate Rain Showers', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    82: { label: 'Violent Rain Showers', icon: 'cloud-rain', iconNight: 'cloud-rain', bg: 'weather-rainy', bgNight: 'weather-rainy' },
    85: { label: 'Slight Snow Showers', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    86: { label: 'Heavy Snow Showers', icon: 'snowflake', iconNight: 'snowflake', bg: 'weather-snowy', bgNight: 'weather-snowy' },
    95: { label: 'Thunderstorm', icon: 'cloud-lightning', iconNight: 'cloud-lightning', bg: 'weather-stormy', bgNight: 'weather-stormy' },
    96: { label: 'Thunderstorm with Hail', icon: 'cloud-lightning', iconNight: 'cloud-lightning', bg: 'weather-stormy', bgNight: 'weather-stormy' },
    99: { label: 'Thunderstorm with Heavy Hail', icon: 'cloud-lightning', iconNight: 'cloud-lightning', bg: 'weather-stormy', bgNight: 'weather-stormy' }
};

// Global App State
let weatherData = null;
let currentCityName = "";
let isCelsius = true;
let searchTimeout = null;
let lightningInterval = null;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const locationPrompt = document.getElementById('location-prompt');
const dashboard = document.getElementById('dashboard');
const errorToast = document.getElementById('error-toast');
const errorMessage = document.getElementById('error-message');
const particlesContainer = document.getElementById('weather-particles');

// Search elements
const headerSearchInput = document.getElementById('search-input');
const headerSuggestions = document.getElementById('suggestions');
const modalSearchInput = document.getElementById('prompt-search-input');
const modalSuggestions = document.getElementById('prompt-suggestions');

// Control elements
const btnLocate = document.getElementById('btn-locate');
const btnUnitToggle = document.getElementById('btn-unit-toggle');
const windyMap = document.getElementById('windy-map');

// Dashboard sub-containers
const currentWeatherContainer = document.getElementById('current-weather');
const hourlyForecastContainer = document.getElementById('hourly-forecast');
const dailyForecastContainer = document.getElementById('daily-forecast');

// Details metrics elements
const feelsLikeVal = document.getElementById('stat-feels-like');
const humidityVal = document.getElementById('stat-humidity');
const windVal = document.getElementById('stat-wind');
const windDirVal = document.getElementById('stat-wind-dir');
const uvVal = document.getElementById('stat-uv');
const uvText = document.getElementById('stat-uv-text');
const rainVal = document.getElementById('stat-rain');
const pressureVal = document.getElementById('stat-pressure');

// Initialize Dashboard
window.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Event Listeners
    btnLocate.addEventListener('click', () => {
        // Force browser geolocation request, clearing cache first
        localStorage.removeItem('cached_weather_city');
        getUserLocation();
    });
    
    btnUnitToggle.addEventListener('click', toggleTempUnit);
    
    // Autocomplete Search inputs
    setupSearchInput(headerSearchInput, headerSuggestions);
    setupSearchInput(modalSearchInput, modalSuggestions);
    
    // Quick select cities in modal
    document.querySelectorAll('.btn-quick-city').forEach(btn => {
        btn.addEventListener('click', () => {
            const lat = parseFloat(btn.dataset.lat);
            const lon = parseFloat(btn.dataset.lon);
            const name = btn.dataset.name;
            
            // Cache selection & fetch
            saveCityToCache(lat, lon, name);
            fetchWeatherData(lat, lon, name);
        });
    });

    // Close suggestion boxes on click outside
    document.addEventListener('click', (e) => {
        if (!headerSearchInput.contains(e.target) && !headerSuggestions.contains(e.target)) {
            headerSuggestions.classList.remove('active');
        }
        if (!modalSearchInput.contains(e.target) && !modalSuggestions.contains(e.target)) {
            modalSuggestions.classList.remove('active');
        }
    });

    // 2. Load Cached City or trigger Geolocation prompt
    const cachedCity = getCityFromCache();
    if (cachedCity) {
        // Load the saved city immediately
        fetchWeatherData(cachedCity.lat, cachedCity.lon, cachedCity.name);
    } else {
        getUserLocation();
    }
});

// Cache management
function saveCityToCache(lat, lon, name) {
    localStorage.setItem('cached_weather_city', JSON.stringify({ lat, lon, name }));
}

function getCityFromCache() {
    const cached = localStorage.getItem('cached_weather_city');
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Show dynamic error toast
function showError(msg) {
    errorMessage.textContent = msg;
    errorToast.classList.add('active');
    setTimeout(() => {
        errorToast.classList.remove('active');
    }, 4500);
}

// Check Geolocation permission & coordinate search
function getUserLocation() {
    showOverlay(loadingScreen);
    hideOverlay(locationPrompt);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const cityName = await reverseGeocode(lat, lon);
                    saveCityToCache(lat, lon, cityName);
                    fetchWeatherData(lat, lon, cityName);
                } catch (err) {
                    saveCityToCache(lat, lon, 'My Location');
                    fetchWeatherData(lat, lon, 'My Location');
                }
            },
            (error) => {
                console.warn("Geolocation access denied or failed:", error);
                // Switch loader overlay to input fallback overlay
                hideOverlay(loadingScreen);
                showOverlay(locationPrompt);
                showError("Unable to access GPS location. Please choose a city below.");
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
    } else {
        hideOverlay(loadingScreen);
        showOverlay(locationPrompt);
        showError("Geolocation is not supported by your browser.");
    }
}

// Reverse Geocoding using free OpenStreetMap Nominatim
async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'AtmosphereWeatherDashboard/1.0' }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.suburb;
        const country = addr.country;
        return city ? `${city}, ${country}` : (addr.state || country || "My Location");
    }
    return "My Location";
}

// Generic autocomplete input binder
function setupSearchInput(inputEl, suggestionsEl) {
    inputEl.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = inputEl.value.trim();
        
        if (query.length < 2) {
            suggestionsEl.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data && data.results) {
                    renderSearchSuggestions(data.results, inputEl, suggestionsEl);
                } else {
                    suggestionsEl.classList.remove('active');
                }
            } catch (err) {
                console.error("Geocoding API error:", err);
            }
        }, 300);
    });
}

// Render autocomplete list
function renderSearchSuggestions(results, inputEl, suggestionsEl) {
    suggestionsEl.innerHTML = '';
    
    results.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const stateField = city.admin1 ? `, ${city.admin1}` : '';
        const countryField = city.country ? `, ${city.country}` : '';
        const fullDetails = `${city.name}${stateField}${countryField}`;
        
        item.innerHTML = `
            <i data-lucide="map-pin" style="width: 16px; color: var(--accent-blue);"></i>
            <div>
                <div class="city-name">${city.name}</div>
                <div class="city-details">${city.admin1 || ''} ${city.country || ''}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            saveCityToCache(city.latitude, city.longitude, fullDetails);
            fetchWeatherData(city.latitude, city.longitude, fullDetails);
            inputEl.value = '';
            suggestionsEl.classList.remove('active');
        });
        
        suggestionsEl.appendChild(item);
    });
    
    suggestionsEl.classList.add('active');
    lucide.createIcons();
}

// Fetch all weather details from Open-Meteo
async function fetchWeatherData(lat, lon, cityName) {
    showOverlay(loadingScreen);
    hideOverlay(locationPrompt);

    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
        
        const res = await fetch(weatherUrl);
        if (!res.ok) throw new Error();
        
        weatherData = await res.json();
        currentCityName = cityName;

        // Sync Windy Interactive Map
        syncWindyMap(lat, lon);

        // Render dashboard UI
        renderWeatherDashboard();

        // Switch screen overlays
        hideOverlay(loadingScreen);
        hideOverlay(locationPrompt);
        dashboard.classList.remove('hidden');
    } catch (err) {
        console.error("Fetch weather error:", err);
        hideOverlay(loadingScreen);
        
        // Show fallback screen if we don't have active dashboard data loaded
        if (!weatherData) {
            showOverlay(locationPrompt);
        } else {
            dashboard.classList.remove('hidden');
        }
        showError("Failed to fetch weather data. Please search again.");
    }
}

// Sync Windy iframe coordinates
function syncWindyMap(lat, lon) {
    // Zoom 6 for local view, overlay wind flow
    windyMap.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=6&level=surface&overlay=wind&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=${lat}&detailLon=${lon}&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
}

// Show/Hide page overlays helper
function showOverlay(el) {
    el.classList.remove('hidden');
}
function hideOverlay(el) {
    el.classList.add('hidden');
}

// Temperature converter helpers
function toFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
}

function formatTemp(tempC) {
    const val = isCelsius ? tempC : toFahrenheit(tempC);
    return `${Math.round(val)}°${isCelsius ? 'C' : 'F'}`;
}

// Toggle Temperature Unit
function toggleTempUnit() {
    isCelsius = !isCelsius;
    
    // Toggle active classes on metric selector
    const cSpan = btnUnitToggle.querySelector('.unit-c');
    const fSpan = btnUnitToggle.querySelector('.unit-f');
    if (isCelsius) {
        cSpan.classList.add('active');
        fSpan.classList.remove('active');
    } else {
        cSpan.classList.remove('active');
        fSpan.classList.add('active');
    }

    // Re-render UI text components locally (fast, no api calls)
    if (weatherData) {
        renderWeatherDashboard();
    }
}

// Main render orchestrator
function renderWeatherDashboard() {
    if (!weatherData) return;
    
    const current = weatherData.current;
    const hourly = weatherData.hourly;
    const daily = weatherData.daily;
    const isDay = current.is_day;
    
    // 1. Backgrounds & Dynamic Particles mapping
    const codeMeta = WEATHER_CODES[current.weather_code] || { label: 'Weather', icon: 'cloud', bg: 'weather-clear-day' };
    const bgClass = isDay ? codeMeta.bg : (codeMeta.bgNight || codeMeta.bg);
    
    document.body.className = '';
    document.body.classList.add(bgClass);
    
    updateBackgroundParticles(current.weather_code, isDay);

    // 2. Current Weather Card
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const currentIcon = isDay ? codeMeta.icon : (codeMeta.iconNight || codeMeta.icon);
    
    currentWeatherContainer.innerHTML = `
        <div class="location">
            <i data-lucide="map-pin" style="width: 20px; height: 20px; color: var(--accent-blue);"></i>
            <span>${currentCityName}</span>
        </div>
        <div class="date">${dateString}</div>
        <div class="weather-hero">
            <i data-lucide="${currentIcon}" class="weather-hero-icon"></i>
            <div class="current-temp-container">
                <span class="current-temp">${Math.round(isCelsius ? current.temperature_2m : toFahrenheit(current.temperature_2m))}<span class="temp-unit">°${isCelsius ? 'C' : 'F'}</span></span>
                <span class="weather-description">${codeMeta.label}</span>
            </div>
        </div>
        <div class="temp-range">
            <span class="high"><i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i> H: ${formatTemp(daily.temperature_2m_max[0])}</span>
            <span class="low"><i data-lucide="arrow-down" style="width: 14px; height: 14px;"></i> L: ${formatTemp(daily.temperature_2m_min[0])}</span>
        </div>
    `;

    // 3. Grid Metrics Details
    feelsLikeVal.textContent = formatTemp(current.apparent_temperature);
    humidityVal.textContent = `${current.relative_humidity_2m}%`;
    windVal.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    
    // Wind Direction converter
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const windIdx = Math.round(current.wind_direction_10m / 22.5) % 16;
    windDirVal.textContent = directions[windIdx];
    
    // UV Index mapping
    const uvIdx = daily.uv_index_max[0];
    uvVal.textContent = uvIdx.toFixed(1);
    
    let uvTextStr = 'Low';
    if (uvIdx > 2) uvTextStr = 'Moderate';
    if (uvIdx > 5) uvTextStr = 'High';
    if (uvIdx > 7) uvTextStr = 'Very High';
    if (uvIdx > 10) uvTextStr = 'Extreme';
    uvText.textContent = uvTextStr;

    rainVal.textContent = `${current.precipitation.toFixed(1)} mm`;
    pressureVal.textContent = `${Math.round(current.pressure_msl)} hPa`;

    // 4. Hourly Forecast Scroll (24 hours)
    const currentHourIndex = new Date().getHours();
    hourlyForecastContainer.innerHTML = '';
    
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
        if (!hourly.time[i]) break;
        
        const temp = hourly.temperature_2m[i];
        const code = hourly.weather_code[i];
        const pop = hourly.precipitation_probability[i];
        
        // Time format
        const date = new Date(hourly.time[i]);
        let hrs = date.getHours();
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
        const timeFormatted = `${hrs} ${ampm}`;
        
        const hourMeta = WEATHER_CODES[code] || { icon: 'cloud', iconNight: 'cloud' };
        const hourlyIcon = isDay ? hourMeta.icon : (hourMeta.iconNight || hourMeta.icon);
        
        const card = document.createElement('div');
        card.className = 'hourly-item';
        card.innerHTML = `
            <span class="hourly-time">${i === currentHourIndex ? 'Now' : timeFormatted}</span>
            <i data-lucide="${hourlyIcon}" class="hourly-icon"></i>
            <span class="hourly-temp">${Math.round(isCelsius ? temp : toFahrenheit(temp))}°</span>
            <span class="hourly-pop">${pop > 0 ? `${pop}%` : ''}</span>
        `;
        hourlyForecastContainer.appendChild(card);
    }

    // 5. 7-Day Forecast list with relative range bars
    dailyForecastContainer.innerHTML = '';
    const weekMin = Math.min(...daily.temperature_2m_min);
    const weekMax = Math.max(...daily.temperature_2m_max);
    
    for (let i = 0; i < 7; i++) {
        const code = daily.weather_code[i];
        const min = daily.temperature_2m_min[i];
        const max = daily.temperature_2m_max[i];
        const pop = daily.precipitation_probability_max[i];
        
        // Date formats
        const dayLabel = i === 0 ? 'Today' : new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
        const dayMeta = WEATHER_CODES[code] || { icon: 'cloud' };
        const dailyIcon = dayMeta.icon;
        
        // Apple weather style progress bar
        const leftPercent = ((min - weekMin) / (weekMax - weekMin)) * 100;
        const widthPercent = ((max - min) / (weekMax - weekMin)) * 100;

        const row = document.createElement('div');
        row.className = 'daily-row';
        row.innerHTML = `
            <span class="daily-day">${dayLabel}</span>
            <span class="daily-pop-container">
                ${pop > 10 ? `<i data-lucide="droplet" style="width: 10px; height: 10px;"></i> <span>${pop}%</span>` : ''}
            </span>
            <i data-lucide="${dailyIcon}" class="daily-row-icon"></i>
            <div class="daily-temp-bar-container">
                <span class="min-temp">${Math.round(isCelsius ? min : toFahrenheit(min))}°</span>
                <div class="temp-bar">
                    <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
                </div>
                <span class="max-temp">${Math.round(isCelsius ? max : toFahrenheit(max))}°</span>
            </div>
        `;
        dailyForecastContainer.appendChild(row);
    }

    // Convert data-lucide placeholders to SVG
    lucide.createIcons();
}

// Generate animated weather particle effects in the background
function updateBackgroundParticles(code, isDay) {
    // Clear old elements & intervals
    particlesContainer.innerHTML = '';
    clearInterval(lightningInterval);

    // Weather condition groups
    const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
    const isSnow = [56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code);
    const isStorm = [95, 96, 99].includes(code);
    const isClear = [0, 1].includes(code);

    if (isRain || isStorm) {
        // Spawn rain drops
        const count = isStorm ? 45 : 30;
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.7}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            particlesContainer.appendChild(drop);
        }
        
        if (isStorm) {
            // Trigger periodic screen lightning flashes
            lightningInterval = setInterval(() => {
                if (Math.random() > 0.4) {
                    document.body.style.filter = 'brightness(2.2) saturate(1.2)';
                    setTimeout(() => {
                        document.body.style.filter = '';
                    }, 80 + Math.random() * 120);
                }
            }, 4000);
        }
    } else if (isSnow) {
        // Spawn drifting snow flakes
        const count = 35;
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake-particle';
            flake.style.left = `${Math.random() * 100}%`;
            const size = 3 + Math.random() * 6;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            flake.style.animationDuration = `${6 + Math.random() * 7}s`;
            flake.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(flake);
        }
    } else if (isClear) {
        if (isDay) {
            // Sunny glowing ray aura
            const ray = document.createElement('div');
            ray.className = 'sun-ray';
            particlesContainer.appendChild(ray);
        } else {
            // Twinkling stars scattered in the sky
            const count = 40;
            for (let i = 0; i < count; i++) {
                const star = document.createElement('div');
                star.className = 'star-particle';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 80}%`;
                const size = 1 + Math.random() * 3;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.animationDuration = `${2 + Math.random() * 3}s`;
                star.style.animationDelay = `${Math.random() * 3}s`;
                particlesContainer.appendChild(star);
            }
        }
    }
}
