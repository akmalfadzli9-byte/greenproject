// weather.js - Ramalan cuaca
(function() {
    let currentWeather = {
        temp: 29, condition: "Kebanyakannya Cerah", humidity: 72, wind: 12, rain: 0, icon: "☀️"
    };
    const forecastData = [
        { day: "Esok", tempHigh: 31, tempLow: 25, condition: "Hujan Petir", humidity: 85, wind: 18, rain: 15, icon: "⛈️" },
        { day: "Rabu", tempHigh: 30, tempLow: 24, condition: "Hujan Ringan", humidity: 82, wind: 14, rain: 8, icon: "🌧️" },
        { day: "Khamis", tempHigh: 29, tempLow: 24, condition: "Mendung", humidity: 78, wind: 12, rain: 2, icon: "☁️" },
        { day: "Jumaat", tempHigh: 30, tempLow: 25, condition: "Cerah Berawan", humidity: 70, wind: 10, rain: 0, icon: "⛅" },
        { day: "Sabtu", tempHigh: 32, tempLow: 26, condition: "Terik", humidity: 65, wind: 8, rain: 0, icon: "☀️" }
    ];
    let refreshInterval;

    function initDarkMode() {
        const saved = localStorage.getItem('greenhouse-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved === 'dark' || (!saved && prefersDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }

    function toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('greenhouse-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('greenhouse-theme', 'dark');
        }
    }

    function generateCurrentWeather() {
        const conditions = [
            { cond: "Cerah", icon: "☀️", tempMin: 28, tempMax: 33, humidMin: 55, humidMax: 75, rainMin: 0, rainMax: 0, windMin: 5, windMax: 12 },
            { cond: "Cerah Berawan", icon: "⛅", tempMin: 27, tempMax: 32, humidMin: 60, humidMax: 80, rainMin: 0, rainMax: 0, windMin: 8, windMax: 15 },
            { cond: "Mendung", icon: "☁️", tempMin: 26, tempMax: 30, humidMin: 70, humidMax: 85, rainMin: 0, rainMax: 3, windMin: 10, windMax: 18 },
            { cond: "Hujan Ringan", icon: "🌧️", tempMin: 25, tempMax: 29, humidMin: 80, humidMax: 92, rainMin: 4, rainMax: 12, windMin: 12, windMax: 22 },
            { cond: "Hujan Petir", icon: "⛈️", tempMin: 24, tempMax: 28, humidMin: 85, humidMax: 95, rainMin: 10, rainMax: 30, windMin: 15, windMax: 28 }
        ];
        const idx = Math.floor(Math.random() * conditions.length);
        const c = conditions[idx];
        const temp = Math.floor(c.tempMin + Math.random() * (c.tempMax - c.tempMin));
        const humidity = Math.floor(c.humidMin + Math.random() * (c.humidMax - c.humidMin));
        const rain = c.rainMin + Math.random() * (c.rainMax - c.rainMin);
        const wind = Math.floor(c.windMin + Math.random() * (c.windMax - c.windMin));
        return { temp, condition: c.cond, humidity, wind, rain: parseFloat(rain.toFixed(1)), icon: c.icon };
    }

    function updateCurrentUI() {
        document.getElementById('current-temp').innerText = currentWeather.temp;
        document.getElementById('current-condition').innerText = currentWeather.condition;
        document.getElementById('current-humidity').innerText = currentWeather.humidity;
        document.getElementById('current-wind').innerText = currentWeather.wind;
        document.getElementById('current-rain').innerText = currentWeather.rain;
        document.getElementById('weather-icon').innerHTML = currentWeather.icon;
    }

    function renderForecast() {
        const container = document.getElementById('forecast-container');
        container.innerHTML = '';
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow p-4 weather-card';
            card.innerHTML = `
                <p class="font-semibold text-center">${day.day}</p>
                <div class="text-4xl text-center my-2">${day.icon}</div>
                <p class="text-center text-lg font-bold">${day.tempHigh}° / ${day.tempLow}°</p>
                <p class="text-center text-xs text-gray-500 dark:text-gray-400">${day.condition}</p>
                <div class="mt-2 text-xs space-y-1 text-center">
                    <div>💧 ${day.humidity}%</div>
                    <div>🌬️ ${day.wind} km/j</div>
                    <div>☔ ${day.rain} mm</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function generateRecommendation() {
        const temp = currentWeather.temp;
        const humidity = currentWeather.humidity;
        const rain = currentWeather.rain;
        const wind = currentWeather.wind;
        const condition = currentWeather.condition;
        let advice = "";
        if (temp > 32) advice += "🔥 Suhu sangat tinggi. Buka sistem pengudaraan dan tingkatkan kekerapan penyiraman. ";
        else if (temp > 30) advice += "🌡️ Suhu panas. Pastikan ventilator berfungsi dan naungan dibuka jika perlu. ";
        else if (temp < 24) advice += "❄️ Suhu agak sejuk. Tutup sedikit bukaan untuk mengekalkan haba. ";
        if (humidity > 85) advice += "💨 Kelembapan tinggi! Risiko kulat. Aktifkan kipas dan kurangkan penyiraman. ";
        else if (humidity < 55) advice += "💧 Kelembapan rendah. Kabus atau siraman tambahan diperlukan. ";
        if (rain > 10) advice += "☔ Hujan lebat dijangkakan. Tutup bukaan bumbung rumah hijau dan periksa saliran. ";
        else if (rain > 0) advice += "🌦️ Hujan ringan. Manfaatkan air hujan untuk simpanan, tetapi elakkan kebocoran. ";
        if (wind > 20) advice += "💨 Angin kencang! Kuatkan struktur dan tutup sisi rumah hijau. ";
        if (condition.includes("Petir")) advice += "⚡ Ribut petir. Cabut plag peralatan elektronik luar dan elakkan aktiviti di ladang. ";
        if (advice === "") advice = "✅ Cuaca baik untuk pertumbuhan tanaman. Teruskan rutin penyelenggaraan biasa.";
        document.getElementById('recommendation').innerHTML = `<p class="text-sm">${advice}</p>`;
    }

    function refreshAllWeather() {
        currentWeather = generateCurrentWeather();
        updateCurrentUI();
        generateRecommendation();
    }

    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(refreshAllWeather, 30 * 60 * 1000);
    }

    function logout() {
        localStorage.removeItem('greenhouse_logged_in');
        window.location.href = 'login.html';
    }

    function checkAuth() {
        const loggedIn = localStorage.getItem('greenhouse_logged_in');
        if (!loggedIn) window.location.href = 'login.html';
    }

    function bindEvents() {
        const darkBtn = document.getElementById('darkmode-toggle');
        if (darkBtn) darkBtn.addEventListener('click', toggleDarkMode);
        const refreshBtn = document.getElementById('refresh-weather');
        if (refreshBtn) refreshBtn.addEventListener('click', refreshAllWeather);
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }

    function init() {
        initDarkMode();
        checkAuth();
        currentWeather = generateCurrentWeather();
        updateCurrentUI();
        renderForecast();
        generateRecommendation();
        bindEvents();
        startAutoRefresh();
    }

    init();
})();