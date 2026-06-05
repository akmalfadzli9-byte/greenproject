// inventory.js - Pengurusan Inventori
(function() {
    let inventory = [];
    const STORAGE_KEY = 'greenhouse_inventory';
    let currentFilter = "all", currentSearch = "";

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

    function loadInventory() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) inventory = JSON.parse(stored);
        else {
            inventory = [
                { id: 1, name: "Baja Organik", category: "Baja", quantity: 45, unit: "kg", reorder: 20, price: 3.50 },
                { id: 2, name: "Benih Tomato Ceri", category: "Benih", quantity: 12, unit: "paket", reorder: 10, price: 8.00 },
                { id: 3, name: "Racun Serangga", category: "Racun", quantity: 8, unit: "liter", reorder: 10, price: 25.00 },
                { id: 4, name: "Gunting Tanaman", category: "Alatan", quantity: 15, unit: "unit", reorder: 5, price: 12.50 },
                { id: 5, name: "Pasu 10 inch", category: "Bekas", quantity: 50, unit: "unit", reorder: 20, price: 4.00 }
            ];
            saveInventory();
        }
        renderInventory();
    }

    function saveInventory() { localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)); }
    function getNextId() { return inventory.length > 0 ? Math.max(...inventory.map(i=>i.id)) + 1 : 1; }

    function renderInventory() {
        let filtered = inventory.filter(item => {
            if (currentFilter !== "all" && item.category !== currentFilter) return false;
            if (currentSearch && !item.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
            return true;
        });
        const tbody = document.getElementById('inventory-table-body');
        if (filtered.length === 0) tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Tiada item</td></tr>';
        else {
            tbody.innerHTML = filtered.map(item => {
                const lowStock = item.quantity <= item.reorder;
                return `<tr class="${lowStock ? 'low-stock' : ''}">
                    <td class="px-5 py-3">${escapeHtml(item.name)}</td>
                    <td class="px-5 py-3">${item.category}</td>
                    <td class="px-5 py-3 ${lowStock ? 'text-red-600 font-bold' : ''}">${item.quantity}</td>
                    <td class="px-5 py-3">${item.unit}</td>
                    <td class="px-5 py-3">${item.reorder}</td>
                    <td class="px-5 py-3">RM ${item.price.toFixed(2)}</td>
                    <td class="px-5 py-3"><button class="edit-item text-green-600 mr-2" data-id="${item.id}">✏️ Edit</button><button class="delete-item text-red-600" data-id="${item.id}">🗑️ Padam</button></td>
                </tr>`;
            }).join('');
        }
        document.getElementById('total-items').innerText = inventory.length;
        document.getElementById('low-stock-count').innerText = inventory.filter(i => i.quantity <= i.reorder).length;
        document.getElementById('total-value').innerText = inventory.reduce((s,i)=> s + (i.quantity * i.price),0).toFixed(2);
        attachItemEvents();
    }

    function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

    function attachItemEvents() {
        document.querySelectorAll('.edit-item').forEach(btn => btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id))));
        document.querySelectorAll('.delete-item').forEach(btn => btn.addEventListener('click', () => { if(confirm('Padam?')) { inventory = inventory.filter(i=>i.id !== parseInt(btn.dataset.id)); saveInventory(); renderInventory(); } }));
    }

    const modal = document.getElementById('item-modal');
    const form = document.getElementById('item-form');
    function openAddModal() {
        document.getElementById('modal-title').innerText = 'Tambah Item';
        document.getElementById('item-id').value = '';
        document.getElementById('item-name').value = '';
        document.getElementById('item-category').value = 'Baja';
        document.getElementById('item-quantity').value = '';
        document.getElementById('item-unit').value = '';
        document.getElementById('item-reorder').value = '';
        document.getElementById('item-price').value = '';
        modal.classList.remove('hidden');
    }
    function openEditModal(id) {
        const item = inventory.find(i=>i.id===id);
        if(!item) return;
        document.getElementById('modal-title').innerText = 'Edit Item';
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-unit').value = item.unit;
        document.getElementById('item-reorder').value = item.reorder;
        document.getElementById('item-price').value = item.price;
        modal.classList.remove('hidden');
    }
    function closeModal() { modal.classList.add('hidden'); }
    function saveItem(e) {
        e.preventDefault();
        const id = document.getElementById('item-id').value ? parseInt(document.getElementById('item-id').value) : null;
        const name = document.getElementById('item-name').value.trim();
        const category = document.getElementById('item-category').value;
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const unit = document.getElementById('item-unit').value.trim();
        const reorder = parseInt(document.getElementById('item-reorder').value);
        const price = parseFloat(document.getElementById('item-price').value);
        if(!name || isNaN(quantity) || !unit || isNaN(reorder) || isNaN(price)) { alert('Lengkapkan ruangan'); return; }
        if(id) {
            const index = inventory.findIndex(i=>i.id===id);
            if(index!==-1) inventory[index] = {...inventory[index], name, category, quantity, unit, reorder, price};
        } else { inventory.push({ id: getNextId(), name, category, quantity, unit, reorder, price }); }
        saveInventory(); renderInventory(); closeModal();
    }

    function exportCSV() {
        if(!inventory.length) { alert('Tiada data'); return; }
        const headers = ["ID","Nama","Kategori","Kuantiti","Unit","Paras Stok","Harga","Nilai Stok"];
        const rows = inventory.map(i => [i.id, i.name, i.category, i.quantity, i.unit, i.reorder, i.price, (i.quantity*i.price).toFixed(2)]);
        const csv = [headers, ...rows].map(r=>r.join(",")).join("\n");
        const blob = new Blob([csv], {type:"text/csv"});
        const url=URL.createObjectURL(blob); const a=document.createElement("a");
        a.href=url; a.download=`inventori_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function bindFilters() {
        document.getElementById('category-filter').addEventListener('change', (e) => { currentFilter = e.target.value; renderInventory(); });
        document.getElementById('search-input').addEventListener('input', (e) => { currentSearch = e.target.value; renderInventory(); });
        document.getElementById('reset-filter').addEventListener('click', () => { document.getElementById('category-filter').value='all'; document.getElementById('search-input').value=''; currentFilter='all'; currentSearch=''; renderInventory(); });
    }

    function checkAuth() { if(!localStorage.getItem('greenhouse_logged_in')) window.location.href='login.html'; }
    function logout() { localStorage.removeItem('greenhouse_logged_in'); window.location.href='login.html'; }

    function bindEvents() {
        document.getElementById('darkmode-toggle').addEventListener('click', toggleDarkMode);
        document.getElementById('add-item-btn').addEventListener('click', openAddModal);
        document.getElementById('modal-cancel').addEventListener('click', closeModal);
        document.getElementById('export-inventory').addEventListener('click', exportCSV);
        form.addEventListener('submit', saveItem);
        document.getElementById('logout-btn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
        modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });
    }

    function init() { initDarkMode(); checkAuth(); loadInventory(); bindFilters(); bindEvents(); }
    init();
})();