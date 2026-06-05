// tasks.js - Pengurusan Tugasan
(function() {
    let tasks = [];
    const STORAGE_KEY = 'greenhouse_tasks';
    let currentStatusFilter = "all", currentSearch = "";

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

    function loadTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if(stored) tasks = JSON.parse(stored);
        else {
            const today = new Date().toISOString().slice(0,10);
            const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
            tasks = [
                { id:1, name:"Siram blok timur", assignee:"Ali", dueDate:today, priority:"Tinggi", status:"Sedang Dijalankan", description:"" },
                { id:2, name:"Baja tomato", assignee:"Pasukan B", dueDate:tomorrow, priority:"Sederhana", status:"Belum Mula", description:"Baja NPK" },
                { id:3, name:"Servis kipas", assignee:"Teknikal", dueDate:today, priority:"Rendah", status:"Selesai", description:"" }
            ];
            saveTasks();
        }
        renderTasks(); updateStats();
    }
    function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    function getNextId() { return tasks.length ? Math.max(...tasks.map(t=>t.id)) + 1 : 1; }

    function renderTasks() {
        let filtered = tasks.filter(t => {
            if(currentStatusFilter !== "all" && t.status !== currentStatusFilter) return false;
            if(currentSearch && !t.name.toLowerCase().includes(currentSearch.toLowerCase()) && !t.assignee.toLowerCase().includes(currentSearch.toLowerCase())) return false;
            return true;
        });
        const container = document.getElementById('tasks-container');
        if(filtered.length === 0) { container.innerHTML = '<div class="col-span-full text-center py-10">Tiada tugasan</div>'; return; }
        container.innerHTML = filtered.map(task => {
            const priorityColor = task.priority === 'Tinggi' ? 'text-red-600' : (task.priority === 'Sederhana' ? 'text-orange-500' : 'text-green-600');
            const statusBadge = task.status === 'Selesai' ? 'bg-green-100 text-green-800 dark:bg-green-900' : (task.status === 'Sedang Dijalankan' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800');
            const isOverdue = (task.status !== 'Selesai' && task.dueDate < new Date().toISOString().slice(0,10));
            return `<div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 ${isOverdue ? 'border-l-4 border-red-500' : ''}">
                <div class="flex justify-between"><h3 class="font-semibold">${escapeHtml(task.name)}</h3><div><button class="edit-task text-blue-600 mr-1" data-id="${task.id}">✏️</button><button class="delete-task text-red-600" data-id="${task.id}">🗑️</button></div></div>
                <div class="text-sm text-gray-500">👤 ${escapeHtml(task.assignee)}</div>
                <div class="flex flex-wrap gap-2 mt-2"><span class="text-xs px-2 py-1 rounded-full ${priorityColor} bg-gray-100">${task.priority}</span><span class="text-xs px-2 py-1 rounded-full ${statusBadge}">${task.status}</span><span class="text-xs px-2 py-1 rounded-full bg-gray-100">📅 ${task.dueDate}</span></div>
                ${task.description ? `<p class="text-sm mt-2">${escapeHtml(task.description)}</p>` : ''}
                ${isOverdue ? '<p class="text-xs text-red-500 mt-1">⚠️ Tarikh akhir lepas!</p>' : ''}
                <div class="mt-3"><select class="status-change text-xs border rounded px-2 py-1" data-id="${task.id}"><option value="Belum Mula" ${task.status==='Belum Mula'?'selected':''}>⏳ Belum Mula</option><option value="Sedang Dijalankan" ${task.status==='Sedang Dijalankan'?'selected':''}>🔄 Sedang Dijalankan</option><option value="Selesai" ${task.status==='Selesai'?'selected':''}>✅ Selesai</option></select></div>
            </div>`;
        }).join('');
        attachTaskEvents();
    }

    function escapeHtml(str) { return str.replace(/[&<>]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

    function attachTaskEvents() {
        document.querySelectorAll('.edit-task').forEach(btn => btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id))));
        document.querySelectorAll('.delete-task').forEach(btn => btn.addEventListener('click', () => { if(confirm('Padam?')) { tasks = tasks.filter(t=>t.id !== parseInt(btn.dataset.id)); saveTasks(); renderTasks(); updateStats(); } }));
        document.querySelectorAll('.status-change').forEach(select => select.addEventListener('change', (e) => { const id = parseInt(select.dataset.id); const task = tasks.find(t=>t.id===id); if(task) { task.status = select.value; saveTasks(); renderTasks(); updateStats(); } }));
    }

    function updateStats() {
        document.getElementById('total-tasks').innerText = tasks.length;
        document.getElementById('pending-tasks').innerText = tasks.filter(t=>t.status==='Belum Mula').length;
        document.getElementById('inprogress-tasks').innerText = tasks.filter(t=>t.status==='Sedang Dijalankan').length;
        document.getElementById('completed-tasks').innerText = tasks.filter(t=>t.status==='Selesai').length;
    }

    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    function openAddModal() {
        document.getElementById('modal-title').innerText = 'Tambah Tugasan';
        document.getElementById('task-id').value = '';
        document.getElementById('task-name').value = '';
        document.getElementById('task-assignee').value = '';
        document.getElementById('task-due').value = new Date().toISOString().slice(0,10);
        document.getElementById('task-priority').value = 'Sederhana';
        document.getElementById('task-status').value = 'Belum Mula';
        document.getElementById('task-desc').value = '';
        modal.classList.remove('hidden');
    }
    function openEditModal(id) {
        const task = tasks.find(t=>t.id===id);
        if(!task) return;
        document.getElementById('modal-title').innerText = 'Edit Tugasan';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-assignee').value = task.assignee;
        document.getElementById('task-due').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-desc').value = task.description || '';
        modal.classList.remove('hidden');
    }
    function closeModal() { modal.classList.add('hidden'); }
    function saveTask(e) {
        e.preventDefault();
        const id = document.getElementById('task-id').value ? parseInt(document.getElementById('task-id').value) : null;
        const name = document.getElementById('task-name').value.trim();
        const assignee = document.getElementById('task-assignee').value.trim();
        const dueDate = document.getElementById('task-due').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const description = document.getElementById('task-desc').value.trim();
        if(!name || !assignee || !dueDate) { alert('Lengkapkan ruangan'); return; }
        if(id) {
            const index = tasks.findIndex(t=>t.id===id);
            if(index!==-1) tasks[index] = {...tasks[index], name, assignee, dueDate, priority, status, description};
        } else { tasks.push({ id: getNextId(), name, assignee, dueDate, priority, status, description }); }
        saveTasks(); renderTasks(); updateStats(); closeModal();
    }

    function bindFilters() {
        document.getElementById('search-task').addEventListener('input', (e) => { currentSearch = e.target.value; renderTasks(); });
        document.getElementById('status-filter').addEventListener('change', (e) => { currentStatusFilter = e.target.value; renderTasks(); });
        document.getElementById('reset-filters').addEventListener('click', () => { document.getElementById('search-task').value=''; document.getElementById('status-filter').value='all'; currentSearch=''; currentStatusFilter='all'; renderTasks(); });
    }

    function checkAuth() { if(!localStorage.getItem('greenhouse_logged_in')) window.location.href='login.html'; }
    function logout() { localStorage.removeItem('greenhouse_logged_in'); window.location.href='login.html'; }

    function bindEvents() {
        document.getElementById('darkmode-toggle').addEventListener('click', toggleDarkMode);
        document.getElementById('add-task-btn').addEventListener('click', openAddModal);
        document.getElementById('modal-cancel').addEventListener('click', closeModal);
        form.addEventListener('submit', saveTask);
        document.getElementById('logout-btn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
        modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });
    }

    function init() { initDarkMode(); checkAuth(); loadTasks(); bindFilters(); bindEvents(); }
    init();
})();