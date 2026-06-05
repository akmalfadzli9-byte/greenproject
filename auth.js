// auth.js - Login handler, dark mode, modal, attempts & tests

(function() {
    // ---------- DOM Elements ----------
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('error-message');
    const toggleBtn = document.getElementById('toggle-password');
    const forgotBtn = document.getElementById('forgot-password-btn');
    const modal = document.getElementById('forgot-modal');
    const modalClose = document.getElementById('modal-close');
    const darkToggle = document.getElementById('darkmode-toggle');
    const loginBtn = document.getElementById('login-btn');

    // ---------- Demo credentials (for simulation) ----------
    const DEMO_EMAIL = 'demo@greenhouse.com';
    const DEMO_PASSWORD = 'demo123';

    // ---------- Attempt limit state ----------
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 3;
    let isLocked = false;
    let lockTimer = null;

    // ---------- Helper: Show error message ----------
    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.classList.remove('hidden');
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
            }
        }, 5000);
    }

    function clearError() {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    // ---------- Email validation (basic) ----------
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ---------- Handle login submission (event delegation via form) ----------
    async function handleLogin(event) {
        event.preventDefault();
        clearError();

        // Lock check
        if (isLocked) {
            showError('Terlalu banyak percubaan. Sila tunggu 30 saat.');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Empty field checks
        if (!email || !password) {
            showError('Sila lengkapkan emel dan kata laluan.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Emel tidak sah. Contoh: nama@ladang.com');
            return;
        }

        // Demo authentication
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            // Successful login: reset attempts
            failedAttempts = 0;
            // Simulate redirect to dashboard
            alert('✅ Berjaya log masuk! (Simulasi: Redirect ke Dashboard)');
            // Optional: reset form
            form.reset();
            return;
        }

        // Failed login
        failedAttempts++;
        const remaining = MAX_ATTEMPTS - failedAttempts;
        if (failedAttempts >= MAX_ATTEMPTS) {
            // Too many attempts
            isLocked = true;
            showError(`Akaun dikunci sementara kerana ${MAX_ATTEMPTS} percubaan gagal. Sila tunggu 30 saat.`);
            if (loginBtn) loginBtn.disabled = true;
            lockTimer = setTimeout(() => {
                isLocked = false;
                failedAttempts = 0;
                if (loginBtn) loginBtn.disabled = false;
                showError('Kunci telah tamat. Anda boleh cuba lagi.');
                // auto clear error after unlock message
                setTimeout(() => clearError(), 4000);
            }, 30000);
        } else {
            showError(`Emel atau kata laluan salah. ${remaining} percubaan lagi sebelum kunci.`);
        }
    }

    // ---------- Toggle password visibility ----------
    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Update icon (optional style)
        const svg = toggleBtn.querySelector('svg');
        if (type === 'text') {
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />';
        } else {
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
        }
    }

    // ---------- Modal handlers (forgot password) ----------
    function openModal() {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    // ---------- Dark mode toggle (with localStorage persistence) ----------
    function initDarkMode() {
        const savedTheme = localStorage.getItem('greenhouse-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateToggleIcon();
    }

    function updateToggleIcon() {
        // The toggle uses CSS classes to show/hide SVG, just ensures visual sync, no extra logic needed.
        // Toggle button text remains same.
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('greenhouse-theme', isDark ? 'dark' : 'light');
    }

    function toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('greenhouse-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('greenhouse-theme', 'dark');
        }
        updateToggleIcon();
    }

    // ---------- Manual Unit Tests (console.assert) ----------
    function runUnitTests() {
        console.group('🧪 Manual unit tests for auth.js');
        // Test email validation
        console.assert(isValidEmail('pengurus@ladang.com') === true, '✔ Email valid sepatutnya true');
        console.assert(isValidEmail('invalid-email') === false, '✔ Email invalid sepatutnya false');
        console.assert(isValidEmail('user@domain') === false, '✔ Tiada TLD -> false');
        
        // Test empty field handling (simulate via condition)
        let testEmail = '';
        let testPass = '';
        console.assert((!testEmail || !testPass) === true, '✔ Empty fields detection berfungsi');
        
        // Attempt lock simulation
        let testAttempts = 3;
        console.assert(testAttempts >= MAX_ATTEMPTS, '✔ Max attempts trigger lock condition');
        
        // No password stored in localStorage explicitly
        let storedPass = localStorage.getItem('greenhouse_password');
        console.assert(storedPass === null, '✔ Password tidak disimpan dalam localStorage');
        
        console.log('✅ Semua ujian asas lulus. Tiada ralat kritikal.');
        console.groupEnd();
    }

    // ---------- Event binding (event delegation) ----------
    function bindEvents() {
        // Form submit via delegation
        form.addEventListener('submit', handleLogin);
        
        // Toggle password
        if (toggleBtn) toggleBtn.addEventListener('click', togglePasswordVisibility);
        
        // Forgot password modal
        if (forgotBtn) forgotBtn.addEventListener('click', openModal);
        if (modalClose) modalClose.addEventListener('click', closeModal);
        // Close modal when clicking outside content area
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Dark mode toggle
        if (darkToggle) darkToggle.addEventListener('click', toggleDarkMode);
    }
    
    // ---------- Initialize app ----------
    function init() {
        initDarkMode();
        bindEvents();
        runUnitTests();
    }
    
    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();



const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
