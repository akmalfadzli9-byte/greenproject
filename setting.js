// tetapan.js - Tetapan Akaun
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

    function loadProfile() {
        const name = localStorage.getItem('greenhouse_user_name') || 'Pengurus Ladang';
        const email = localStorage.getItem('greenhouse_user_email') || 'pengurus@ladang.com';
        const phone = localStorage.getItem('greenhouse_user_phone') || '';
        document.getElementById('fullname').value = name;
        document.getElementById('email').value = email;
        document.getElementById('phone').value = phone;
        document.getElementById('display-name').innerText = name;
        document.getElementById('display-email').innerText = email;
        document.getElementById('user-initial').innerText = name.charAt(0).toUpperCase();
    }

    function saveProfile() {
        const name = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!name || !email) { alert('Nama dan emel wajib diisi.'); return; }
        if (!email.includes('@') || !email.includes('.')) { alert('Emel tidak sah.'); return; }
        localStorage.setItem('greenhouse_user_name', name);
        localStorage.setItem('greenhouse_user_email', email);
        localStorage.setItem('greenhouse_user_phone', phone);
        document.getElementById('display-name').innerText = name;
        document.getElementById('display-email').innerText = email;
        document.getElementById('user-initial').innerText = name.charAt(0).toUpperCase();
        alert('Profil berjaya disimpan!');
    }

    function loadNotifications() {
        document.getElementById('notif-email').checked = localStorage.getItem('greenhouse_notif_email') === 'true';
        document.getElementById('notif-daily').checked = localStorage.getItem('greenhouse_notif_daily') === 'true';
        document.getElementById('notif-report').checked = localStorage.getItem('greenhouse_notif_report') === 'true';
    }

    function saveNotifications() {
        localStorage.setItem('greenhouse_notif_email', document.getElementById('notif-email').checked);
        localStorage.setItem('greenhouse_notif_daily', document.getElementById('notif-daily').checked);
        localStorage.setItem('greenhouse_notif_report', document.getElementById('notif-report').checked);
        alert('Keutamaan notifikasi disimpan.');
    }

    function changePassword() {
        const current = document.getElementById('current-pwd').value;
        const newPwd = document.getElementById('new-pwd').value;
        const confirm = document.getElementById('confirm-pwd').value;
        if (!current || !newPwd || !confirm) { alert('Lengkapkan ruangan.'); return; }
        if (newPwd !== confirm) { alert('Kata laluan baru tidak sepadan.'); return; }
        if (newPwd.length < 4) { alert('Minimum 4 aksara.'); return; }
        alert('Kata laluan berjaya ditukar (simulasi).');
        document.getElementById('current-pwd').value = '';
        document.getElementById('new-pwd').value = '';
        document.getElementById('confirm-pwd').value = '';
    }

    function logout() { localStorage.removeItem('greenhouse_logged_in'); window.location.href = 'login.html'; }
    function checkAuth() { if (!localStorage.getItem('greenhouse_logged_in')) window.location.href = 'login.html'; }

    function bindEvents() {
        document.getElementById('darkmode-toggle').addEventListener('click', toggleDarkMode);
        document.getElementById('save-profile').addEventListener('click', saveProfile);
        document.getElementById('save-notif').addEventListener('click', saveNotifications);
        document.getElementById('change-pwd-btn').addEventListener('click', changePassword);
        document.getElementById('logout-btn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }

    function init() { initDarkMode(); checkAuth(); loadProfile(); loadNotifications(); bindEvents(); }
    init();
})();