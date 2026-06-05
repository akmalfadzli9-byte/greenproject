// dashboard.js - Dashboard utama
(function() {
    // Dark mode
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

    function logout() {
        localStorage.removeItem('greenhouse_logged_in');
        window.location.href = 'login.html';
    }

    function setUserGreeting() {
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            let name = localStorage.getItem('greenhouse_user_name');
            if (!name) {
                const email = localStorage.getItem('greenhouse_user_email');
                if (email) name = email.split('@')[0];
                else name = 'Pengurus';
            }
            userNameSpan.textContent = name;
        }
    }

    function checkAuth() {
        const loggedIn = localStorage.getItem('greenhouse_logged_in');
        if (!loggedIn) window.location.href = 'login.html';
    }

    function bindEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        const darkToggle = document.getElementById('darkmode-toggle-dashboard');
        if (darkToggle) darkToggle.addEventListener('click', toggleDarkMode);
    }

    function syncFromLogin() {
        if (!localStorage.getItem('greenhouse_logged_in')) {
            localStorage.setItem('greenhouse_logged_in', 'true');
            localStorage.setItem('greenhouse_user_email', 'pengurus@ladang.com');
            localStorage.setItem('greenhouse_user_name', 'En. Ahmad');
        }
    }

    function init() {
        syncFromLogin();
        initDarkMode();
        setUserGreeting();
        bindEvents();
        checkAuth();
    }

    init();
})();