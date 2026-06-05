const API_BASE = 'http://localhost:3000/api';

let authToken = localStorage.getItem('token');

function setAuthToken(token) {
    authToken = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API error');
    }
    return response.json();
}

// Auth functions
async function login(email, password) {
    const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setAuthToken(data.token);
    return data.user;
}

async function register(userData) { ... }

// Tanaman CRUD
async function getTanaman() { return apiCall('/tanaman'); }
async function createTanaman(data) { return apiCall('/tanaman', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTanaman(id, data) { return apiCall(`/tanaman/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTanaman(id) { return apiCall(`/tanaman/${id}`, { method: 'DELETE' }); }

// Sensor
async function getSensorLatest(cropId) { return apiCall(`/sensor/latest/${cropId}`); }

// Laporan
async function getHarvestAnalytics() { return apiCall('/laporan/analytics/harvest'); }
async function exportCSV() { window.open(`${API_BASE}/laporan/export/csv?token=${authToken}`); }
async function exportPDF() { window.open(`${API_BASE}/laporan/export/pdf?token=${authToken}`); }

// Notifikasi (trigger)
async function sendTestNotification(type, recipient, message) {
    return apiCall('/notifikasi/test', { method: 'POST', body: JSON.stringify({ type, recipient, message }) });
}
