// report.js - Laporan Hasil Tuaian
(function() {
    let tempChart = null;

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
        if (tempChart) updateChartColors();
    }

    function initChart() {
        const canvas = document.getElementById('tempChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? '#374151' : '#e5e7eb';
        const textColor = isDark ? '#d1d5db' : '#4b5563';
        if (tempChart) tempChart.destroy();
        tempChart = new Chart(ctx, {
            type: 'line',
            data: { labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'], datasets: [{ label: 'Suhu (°C)', data: [27.2, 28.1, 29.0, 28.8], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 }] },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { labels: { color: textColor } } },
                scales: { y: { grid: { color: gridColor }, ticks: { color: textColor } }, x: { grid: { color: gridColor }, ticks: { color: textColor } } }
            }
        });
    }

    function updateChartColors() { initChart(); }

    function printReport() { window.print(); }

    function checkAuth() { if (!localStorage.getItem('greenhouse_logged_in')) window.location.href = 'login.html'; }
    function logout() { localStorage.removeItem('greenhouse_logged_in'); window.location.href = 'login.html'; }

    function bindEvents() {
        document.getElementById('darkmode-toggle').addEventListener('click', toggleDarkMode);
        document.getElementById('printReport').addEventListener('click', printReport);
        document.getElementById('logout-btn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }

    function init() { initDarkMode(); checkAuth(); initChart(); bindEvents(); }
    init();
})();