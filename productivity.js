// productivity.js - Produktiviti Ladang
(function() {
    let productivityRecords = [];
    const STORAGE_KEY = 'greenhouse_productivity';
    let trendChart, areaChart;

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
        updateCharts();
    }

    function loadProductivity() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) productivityRecords = JSON.parse(stored);
        else {
            const today = new Date();
            productivityRecords = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today); d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().slice(0,10);
                const total = Math.floor(8 + Math.random() * 5);
                const done = Math.floor(total * (0.6 + Math.random() * 0.35));
                productivityRecords.push({ id: Date.now() - i, date: dateStr, tasksDone: done, tasksTotal: total, workers: Math.floor(3+Math.random()*5), harvestYield: parseFloat((50+Math.random()*150).toFixed(1)) });
            }
            saveProductivity();
        }
        renderProductivity();
        updateKPIs();
        updateCharts();
    }
    function saveProductivity() { localStorage.setItem(STORAGE_KEY, JSON.stringify(productivityRecords)); }
    function getNextId() { return productivityRecords.length ? Math.max(...productivityRecords.map(r=>r.id)) + 1 : 1; }

    function renderProductivity() {
        const tbody = document.getElementById('productivity-table-body');
        if(!productivityRecords.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Tiada rekod</td></tr>'; return; }
        const sorted = [...productivityRecords].sort((a,b)=>new Date(b.date)-new Date(a.date));
        tbody.innerHTML = sorted.map(rec => {
            const percent = ((rec.tasksDone/rec.tasksTotal)*100).toFixed(0);
            return `<tr><td class="px-5 py-3">${rec.date}</td><td class="px-5 py-3">${rec.tasksDone}</td><td class="px-5 py-3">${rec.tasksTotal}</td>
                    <td class="px-5 py-3"><div class="flex items-center gap-2"><span>${percent}%</span><div class="w-16 bg-gray-200 rounded-full h-2"><div class="bg-green-600 h-2 rounded-full" style="width:${percent}%"></div></div></div></td>
                    <td class="px-5 py-3">${rec.workers}</td><td class="px-5 py-3">${rec.harvestYield} kg</td>
                    <td class="px-5 py-3"><button class="delete-record text-red-600" data-id="${rec.id}">🗑️ Padam</button></td></tr>`;
        }).join('');
        document.querySelectorAll('.delete-record').forEach(btn => btn.addEventListener('click', () => {
            if(confirm('Padam?')) { productivityRecords = productivityRecords.filter(r=>r.id !== parseInt(btn.dataset.id)); saveProductivity(); renderProductivity(); updateKPIs(); updateCharts(); }
        }));
    }

    function updateKPIs() {
        if(!productivityRecords.length) return;
        const last7 = productivityRecords.slice(-7);
        const totalTasks = last7.reduce((s,r)=>s+r.tasksTotal,0);
        const totalDone = last7.reduce((s,r)=>s+r.tasksDone,0);
        const completionRate = totalTasks===0?0:(totalDone/totalTasks)*100;
        document.getElementById('task-completion').innerText = Math.round(completionRate);
        document.getElementById('task-progress-bar').style.width = completionRate+'%';
        const totalHarvest = last7.reduce((s,r)=>s+r.harvestYield,0);
        const totalWorkers = last7.reduce((s,r)=>s+r.workers,0);
        const workerProd = totalWorkers===0?0:Math.min(100,(totalHarvest/totalWorkers)*2);
        document.getElementById('worker-productivity').innerText = Math.round(workerProd);
        const avgYieldPerDay = totalHarvest/last7.length;
        document.getElementById('yield-per-sqm').innerText = (avgYieldPerDay/1000).toFixed(2);
        const avgTaskTime = totalDone===0?0:(totalTasks*0.5)/totalDone;
        document.getElementById('avg-task-time').innerText = avgTaskTime.toFixed(1);
    }

    function groupRecordsByWeek() {
        const weeks = {};
        productivityRecords.forEach(rec => {
            const date = new Date(rec.date);
            const weekStart = new Date(date); weekStart.setDate(date.getDate()-date.getDay());
            const weekKey = weekStart.toISOString().slice(0,10);
            if(!weeks[weekKey]) weeks[weekKey] = { totalTasks:0, totalDone:0 };
            weeks[weekKey].totalTasks += rec.tasksTotal;
            weeks[weekKey].totalDone += rec.tasksDone;
        });
        const sortedWeeks = Object.keys(weeks).sort().slice(-6);
        return sortedWeeks.map(week => ({ week: week.slice(5), completion: weeks[week].totalTasks===0?0:(weeks[week].totalDone/weeks[week].totalTasks)*100 }));
    }

    function updateCharts() {
        const weeksData = groupRecordsByWeek();
        const labels = weeksData.map(w=>w.week);
        const completions = weeksData.map(w=>w.completion);
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#d1d5db' : '#4b5563';
        const gridColor = isDark ? '#374151' : '#e5e7eb';
        if(trendChart) trendChart.destroy();
        const ctxTrend = document.getElementById('productivityTrendChart').getContext('2d');
        trendChart = new Chart(ctxTrend, {
            type: 'line', data: { labels, datasets: [{ label: 'Kadar Selesai (%)', data: completions, borderColor: '#10b981', fill: true, tension: 0.3 }] },
            options: { responsive: true, plugins: { legend: { labels: { color: textColor } } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, min:0, max:100 } }, x: { ticks: { color: textColor } } } }
        });
        if(areaChart) areaChart.destroy();
        const ctxArea = document.getElementById('areaProductivityChart').getContext('2d');
        areaChart = new Chart(ctxArea, {
            type: 'bar', data: { labels: ['Blok Timur','Blok Barat','Blok Utara','Blok Selatan'], datasets: [{ label: 'Produktiviti (%)', data: [78,65,82,71], backgroundColor: 'rgba(16,185,129,0.7)' }] },
            options: { responsive: true, plugins: { legend: { labels: { color: textColor } } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, min:0, max:100 } }, x: { ticks: { color: textColor } } } }
        });
    }

    const modal = document.getElementById('record-modal');
    const form = document.getElementById('productivity-form');
    function openModal() { document.getElementById('record-date').value = new Date().toISOString().slice(0,10); modal.classList.remove('hidden'); }
    function closeModal() { modal.classList.add('hidden'); }
    function addRecord(e) {
        e.preventDefault();
        const date = document.getElementById('record-date').value;
        const tasksDone = parseInt(document.getElementById('tasks-done').value);
        const tasksTotal = parseInt(document.getElementById('tasks-total').value);
        const workers = parseInt(document.getElementById('workers').value);
        const harvestYield = parseFloat(document.getElementById('harvest-yield').value);
        if(!date || isNaN(tasksDone) || isNaN(tasksTotal) || isNaN(workers) || isNaN(harvestYield)) { alert('Lengkapkan ruangan'); return; }
        if(tasksDone > tasksTotal) { alert('Tugasan selesai tidak boleh melebihi jumlah'); return; }
        const existing = productivityRecords.find(r=>r.date===date);
        if(existing) {
            if(confirm('Gantikan?')) { existing.tasksDone=tasksDone; existing.tasksTotal=tasksTotal; existing.workers=workers; existing.harvestYield=harvestYield; saveProductivity(); }
        } else { productivityRecords.push({ id: getNextId(), date, tasksDone, tasksTotal, workers, harvestYield }); saveProductivity(); }
        renderProductivity(); updateKPIs(); updateCharts(); closeModal();
    }

    function exportCSV() {
        if(!productivityRecords.length) { alert('Tiada data'); return; }
        const headers = ["Tarikh","Tugasan Selesai","Jumlah Tugasan","Peratus","Pekerja","Hasil(kg)"];
        const rows = productivityRecords.map(r => [r.date, r.tasksDone, r.tasksTotal, ((r.tasksDone/r.tasksTotal)*100).toFixed(0)+'%', r.workers, r.harvestYield]);
        const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
        const blob = new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a");
        a.href=url; a.download=`produktiviti_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function checkAuth() { if(!localStorage.getItem('greenhouse_logged_in')) window.location.href='login.html'; }
    function logout() { localStorage.removeItem('greenhouse_logged_in'); window.location.href='login.html'; }

    function bindEvents() {
        document.getElementById('darkmode-toggle').addEventListener('click', toggleDarkMode);
        document.getElementById('add-record-btn').addEventListener('click', openModal);
        document.getElementById('modal-cancel').addEventListener('click', closeModal);
        document.getElementById('export-productivity').addEventListener('click', exportCSV);
        form.addEventListener('submit', addRecord);
        document.getElementById('logout-btn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
        modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });
    }

    function init() { initDarkMode(); checkAuth(); loadProductivity(); bindEvents(); }
    init();
})();