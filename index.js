// index.js - Dark mode untuk landing page
(function() {
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

    function bindEvents() {
        const btn1 = document.getElementById('darkmode-toggle-landing');
        const btn2 = document.getElementById('darkmode-footer');
        if (btn1) btn1.addEventListener('click', toggleDarkMode);
        if (btn2) btn2.addEventListener('click', toggleDarkMode);
    }

    initDarkMode();
    bindEvents();
})();