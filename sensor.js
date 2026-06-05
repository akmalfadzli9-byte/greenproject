// sensor.js - Pemantauan sensor
(function() {
    let sensorData = {
        suhu: 28.5,
        kelembapanTanah: 74,
        kelembapanUdara: 68,
        ph: 6.8,
        cahaya: 18500
    };
    let historyTemperatures = [27.2, 27.8, 28.1, 28.5, 28.9, 29.2, 29.0, 28.7, 28.4, 28.0, 27.6, 27.3];
    let timeLabels = ['12am','2am','4am','6am','8am','10am','12pm','2pm','4pm','6pm','8pm','10pm'];
    let tempChartInstance = null;
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
        if (tempChartInstance) updateChartTheme();
    }

    function generateRandomSensorData() {
        sensorData.suhu = +(27.5 + Math.random() * 3).toFixed(1);
        sensorData.kelembapanTanah = Math.floor(65 + Math.random() * 25);
        sensorData.kelembapanUdara = Math.floor(55 + Math.random() * 30);
        sensorData.ph = +(6.2 + Math.random() * 1.2).toFixed(1);
        sensorData.cahaya = Math.floor(12000 + Math.random() * 12000);
        updateUI();
        updateAlerts();
        addHistoryPoint(sensorData.suhu);
    }

    function updateUI() {
        document.getElementById('suhu-value').innerText = sensorData.suhu;
        document.getElementById('kelembapan-value').innerText = sensorData.kelembapanTanah;
        document.getElementById('humidity-value').innerText = sensorData.kelembapanUdara;
        document.getElementById('ph-value').innerText = sensorData.ph;
        document.getElementById('light-value').innerText = sensorData.cahaya;

        const suhuStatus = document.getElementById('suhu-status');
        if (sensorData.suhu > 30) {
            suhuStatus.innerHTML = '⚠️ Terlalu panas! (>30°C)';
            suhuStatus.className = 'mt-2 text-xs text-red-600 dark:text-red-400';
            document.getElementById('card-suhu').classList.add('blink-red');
        } else if (sensorData.suhu < 24) {
            suhuStatus.innerHTML = '⚠️ Sejuk (<24°C)';
            suhuStatus.className = 'mt-2 text-xs text-blue-600 dark:text-blue-400';
            document.getElementById('card-suhu').classList.add('blink-red');
        } else {
            suhuStatus.innerHTML = '✅ Normal (24-30°C)';
            suhuStatus.className = 'mt-2 text-xs text-green-600 dark:text-green-400';
            document.getElementById('card-suhu').classList.remove('blink-red');
        }

        const tanahStatus = document.getElementById('kelembapan-status');
        if (sensorData.kelembapanTanah < 60) tanahStatus.innerHTML = '⚠️ Kering, perlu siram';
        else if (sensorData.kelembapanTanah > 85) tanahStatus.innerHTML = '⚠️ Terlalu basah';
        else tanahStatus.innerHTML = '✅ Optimal (60-85%)';
        tanahStatus.className = (sensorData.kelembapanTanah < 60 || sensorData.kelembapanTanah > 85) ? 
            'mt-2 text-xs text-red-600 dark:text-red-400' : 'mt-2 text-xs text-green-600 dark:text-green-400';

        const udaraStatus = document.getElementById('humidity-status');
        if (sensorData.kelembapanUdara < 50) udaraStatus.innerHTML = '⚠️ Udara kering';
        else if (sensorData.kelembapanUdara > 80) udaraStatus.innerHTML = '⚠️ Kelembapan tinggi, risiko kulat';
        else udaraStatus.innerHTML = '✅ Normal (50-80%)';
        udaraStatus.className = (sensorData.kelembapanUdara < 50 || sensorData.kelembapanUdara > 80) ? 
            'mt-2 text-xs text-red-600 dark:text-red-400' : 'mt-2 text-xs text-green-600 dark:text-green-400';

        const phStatus = document.getElementById('ph-status');
        if (sensorData.ph < 6.0) phStatus.innerHTML = '⚠️ Tanah terlalu masam (baja kapur diperlukan)';
        else if (sensorData.ph > 7.5) phStatus.innerHTML = '⚠️ Tanah beralkali';
        else phStatus.innerHTML = '✅ Sesuai untuk kebanyakan tanaman (6.0-7.5)';
        phStatus.className = (sensorData.ph < 6.0 || sensorData.ph > 7.5) ? 
            'mt-2 text-xs text-red-600 dark:text-red-400' : 'mt-2 text-xs text-green-600 dark:text-green-400';

        const lightStatus = document.getElementById('light-status');
        if (sensorData.cahaya < 10000) lightStatus.innerHTML = '⚠️ Cahaya rendah, pertumbuhan terbantut';
        else if (sensorData.cahaya > 25000) lightStatus.innerHTML = '⚠️ Cahaya tinggi, risiko terbakar daun';
        else lightStatus.innerHTML = '✅ Baik (10000-25000 lux)';
        lightStatus.className = (sensorData.cahaya < 10000 || sensorData.cahaya > 25000) ? 
            'mt-2 text-xs text-red-600 dark:text-red-400' : 'mt-2 text-xs text-green-600 dark:text-green-400';
    }

    function updateAlerts() {
        const container = document.getElementById('alert-container');
        let alerts = [];
        if (sensorData.suhu > 30) alerts.push('🌡️ Suhu melebihi 30°C – buka ventilator atau kipas.');
        if (sensorData.kelembapanTanah < 60) alerts.push('💧 Kelembapan tanah rendah – jadualkan siraman automatik.');
        if (sensorData.kelembapanTanah > 85) alerts.push('💧 Kelembapan tanah terlalu tinggi – kurangkan siraman.');
        if (sensorData.kelembapanUdara > 80) alerts.push('💨 Kelembapan udara tinggi – risiko penyakit kulat.');
        if (sensorData.ph < 6.0) alerts.push('🧪 Tanah terlalu masam – tambah kapur pertanian.');
        if (sensorData.cahaya < 10000) alerts.push('☀️ Cahaya rendah – pertimbangkan lampu grow light.');
        if (alerts.length === 0) {
            container.innerHTML = '<div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">✅ Semua parameter dalam julat normal. Teruskan pemantauan.</div>';
        } else {
            container.innerHTML = alerts.map(alert => `<div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded text-sm">⚠️ ${alert}</div>`).join('');
        }
    }

    function initChart() {
        const ctx = document.getElementById('tempHistoryChart').getContext('2d');
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? '#374151' : '#e5e7eb';
        const textColor = isDark ? '#d1d5db' : '#4b5563';
        
        if (tempChartInstance) tempChartInstance.destroy();
        tempChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Suhu (°C)',
                    data: historyTemperatures,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#059669'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { color: gridColor }, ticks: { color: textColor, rotation: -30 } }
                }
            }
        });
    }

    function updateChartTheme() {
        if (tempChartInstance) {
            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? '#374151' : '#e5e7eb';
            const textColor = isDark ? '#d1d5db' : '#4b5563';
            tempChartInstance.options.scales.y.grid.color = gridColor;
            tempChartInstance.options.scales.x.grid.color = gridColor;
            tempChartInstance.options.scales.y.ticks.color = textColor;
            tempChartInstance.options.scales.x.ticks.color = textColor;
            tempChartInstance.options.plugins.legend.labels.color = textColor;
            tempChartInstance.update();
        }
    }

    function addHistoryPoint(newTemp) {
        historyTemperatures.push(newTemp);
        if (historyTemperatures.length > 12) historyTemperatures.shift();
        if (tempChartInstance) {
            tempChartInstance.data.datasets[0].data = historyTemperatures;
            tempChartInstance.update();
        }
    }

    function startAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(generateRandomSensorData, 10000);
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
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) refreshBtn.addEventListener('click', generateRandomSensorData);
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }

    function init() {
        initDarkMode();
        checkAuth();
        initChart();
        generateRandomSensorData();
        bindEvents();
        startAutoRefresh();
    }

    init();
})();