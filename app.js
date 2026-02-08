// ============================================
// APLIKASI STOK PINTAR - MANAJEMEN STOK PRODUK
// ============================================

// DATABASE
let database = JSON.parse(localStorage.getItem('stok_app_db')) || [];
let currentCategory = '';
let deferredPrompt = null;
let currentEditingProductId = null;

// DOM ELEMENTS
const pageHome = document.getElementById('page-home');
const pageList = document.getElementById('page-list');
const listContainer = document.getElementById('list-container');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('cari');
const navBtns = document.querySelectorAll('.nav-btn');
const categoryTitle = document.getElementById('categoryTitle');
const productCount = document.getElementById('productCount');
const clearSearchBtn = document.getElementById('clearSearch');

// MODAL ELEMENTS
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancel = document.getElementById('confirmCancel');
const confirmOk = document.getElementById('confirmOk');

const editPriceModal = document.getElementById('editPriceModal');
const editProductName = document.getElementById('editProductName');
const editHargaBeli = document.getElementById('editHargaBeli');
const editHargaJual = document.getElementById('editHargaJual');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// UI ELEMENTS
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const installBtn = document.getElementById('installBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const statsContainer = document.getElementById('statsContainer');
const clearDataBtn = document.getElementById('clearDataBtn');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Aplikasi Stok Pintar dimuat');
    console.log(`📊 Total produk: ${database.length}`);
    
    initializeTheme();
    initializeNavigation();
    initializeEventListeners();
    renderStats();
    
    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 PWA install prompt tersedia');
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'flex';
        setTimeout(() => {
            showToast('📲 Aplikasi bisa diinstall ke home screen', 'info');
        }, 2000);
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('✅ Aplikasi terinstall');
        deferredPrompt = null;
        installBtn.style.display = 'none';
        showToast('🎉 Aplikasi berhasil diinstal!', 'success');
    });
    
    // Auto-focus search when on list page
    if (window.location.hash === '#list') {
        showPage('narita');
    }
});

// ============================================
// THEME FUNCTIONS
// ============================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    showToast(`🌓 Tema ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.title = `Tema ${theme === 'dark' ? 'gelap' : 'terang'}`;
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function initializeNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            showPage(page);
        });
    });
}

function showPage(page) {
    // Update active nav button
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });
    
    // Show selected page
    if (page === 'home') {
        pageHome.classList.add('active');
        pageList.classList.remove('active');
        document.getElementById('nama').focus();
        renderStats();
    } else {
        currentCategory = page;
        pageHome.classList.remove('active');
        pageList.classList.add('active');
        
        // Update category title
        const categoryNames = {
            'narita': 'NARITA',
            'vr': 'VR', 
            'kudus': 'KUDUS',
            'lain': 'LAIN LAIN'
        };
        categoryTitle.innerHTML = `<i class="fas fa-box"></i> Produk ${categoryNames[page]}`;
        
        renderData();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Save Product
    document.getElementById('simpanProduk').addEventListener('click', simpanData);
    
    // Enter key to save
    document.getElementById('nama').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('jual').focus();
        }
    });
    
    document.getElementById('jual').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            simpanData();
        }
    });
    
    // Backup/Restore
    document.getElementById('backupBtn').addEventListener('click', exportData);
    document.getElementById('fileInput').addEventListener('change', importData);
    
    // Clear all data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('HAPUS SEMUA DATA? Semua produk akan dihapus permanen!')) {
            database = [];
            saveToLocalStorage();
            showToast('🗑️ Semua data berhasil dihapus', 'success');
            renderStats();
            if (pageList.classList.contains('active')) {
                renderData();
            }
        }
    });
    
    // Search
    searchInput.addEventListener('input', () => {
        renderData();
        clearSearchBtn.style.display = searchInput.value ? 'flex' : 'none';
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderData();
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
    });
    
    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Install App
    installBtn.addEventListener('click', installApp);
    
    // Modal - Delete
    confirmCancel.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });
    
    confirmOk.addEventListener('click', handleConfirmDelete);
    
    // Modal - Edit Price
    cancelEditBtn.addEventListener('click', () => {
        editPriceModal.classList.remove('show');
        currentEditingProductId = null;
    });
    
    saveEditBtn.addEventListener('click', saveEditedPrice);
    
    // Enter key in edit modal
    editHargaJual.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditedPrice();
        }
    });
    
    // Close modals with ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            confirmModal.classList.remove('show');
            editPriceModal.classList.remove('show');
            currentEditingProductId = null;
        }
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
        }
        if (e.target === editPriceModal) {
            editPriceModal.classList.remove('show');
            currentEditingProductId = null;
        }
    });
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function simpanData() {
    showLoading(true);
    
    const nama = document.getElementById('nama').value.trim();
    const kode = document.getElementById('kode').value.trim();
    const beli = document.getElementById('beli').value;
    const jual = document.getElementById('jual').value;
    const kategori = document.getElementById('kategori').value;
    
    // Validasi
    if (!nama) {
        showToast('❌ Nama produk harus diisi!', 'error');
        document.getElementById('nama').focus();
        showLoading(false);
        return;
    }
    
    if (!jual || parseInt(jual) <= 0) {
        showToast('❌ Harga jual harus diisi!', 'error');
        document.getElementById('jual').focus();
        showLoading(false);
        return;
    }
    
    // Buat produk baru
    const produkBaru = {
        id: Date.now(),
        nama: nama,
        kode: kode || generateProductCode(nama),
        beli: parseInt(beli) || 0,
        jual: parseInt(jual),
        kategori: kategori,
        stok: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    database.push(produkBaru);
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('nama').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('beli').value = '0';
    document.getElementById('jual').value = '';
    document.getElementById('nama').focus();
    
    showLoading(false);
    showToast(`✅ "${nama}" ditambahkan ke ${kategori.toUpperCase()}`, 'success');
    renderStats();
    
    // Auto switch to the category if on list page
    if (pageList.classList.contains('active') && currentCategory === kategori) {
        renderData();
    }
}

function generateProductCode(nama) {
    // Generate kode dari nama produk
    const words = nama.toUpperCase().split(' ');
    let code = '';
    
    if (words.length === 1) {
        code = words[0].substring(0, 3);
    } else {
        words.forEach(word => {
            if (word.length > 0) {
                code += word[0];
            }
        });
    }
    
    // Tambahkan angka random
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${code}-${randomNum}`;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderData() {
    if (!currentCategory) return;
    
    const search = searchInput.value.toLowerCase();
    const filteredData = database.filter(item => 
        item.kategori === currentCategory && 
        (item.nama.toLowerCase().includes(search) || 
         item.kode.toLowerCase().includes(search))
    );
    
    // Update product count
    const count = filteredData.length;
    productCount.textContent = `${count} produk`;
    productCount.className = `badge ${count === 0 ? 'badge-warning' : 'badge-success'}`;
    
    // Show empty state or products
    if (count === 0) {
        emptyState.style.display = 'block';
        listContainer.innerHTML = '';
        
        if (search) {
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>Produk tidak ditemukan</h3>
                <p>Tidak ada produk yang sesuai dengan pencarian: "${search}"</p>
            `;
        }
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by name
    filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
    
    // Render products with HORIZONTAL LAYOUT
    listContainer.innerHTML = filteredData.map(item => `
        <div class="product-card" data-id="${item.id}">
            <!-- LEFT: Product Info -->
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-title">${escapeHtml(item.nama)}</h3>
                    <span class="product-id">${escapeHtml(item.kode)}</span>
                </div>
                
                <div class="product-prices">
                    <div class="price-row">
                        <span class="price-label">Beli:</span>
                        <div class="harga-value beli" onclick="openEditPriceModal(${item.id})" 
                             title="Klik untuk edit harga beli">
                            ${formatRupiah(item.beli)}
                            <i class="fas fa-edit edit-icon"></i>
                        </div>
                    </div>
                    
                    <div class="price-row">
                        <span class="price-label">Jual:</span>
                        <div class="harga-value jual" onclick="openEditPriceModal(${item.id})" 
                             title="Klik untuk edit harga jual" style="color: #dc2626;">
                            ${formatRupiah(item.jual)}
                            <i class="fas fa-edit edit-icon" style="color: #dc2626;"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- RIGHT: Stock Control & Actions -->
            <div class="product-actions">
                <!-- Stock Control -->
                <div class="stock-control">
                    <div class="stock-header">
                        <span class="stock-label">STOK</span>
                        <span class="stock-value" id="stock-${item.id}">${item.stok}</span>
                    </div>
                    <div class="stock-buttons">
                        <button class="stock-btn minus" onclick="changeStock(${item.id}, -1)" 
                                title="Kurangi stok" ${item.stok <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="stock-btn plus" onclick="changeStock(${item.id}, 1)" 
                                title="Tambah stok">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Delete Button -->
                <button class="delete-btn" onclick="confirmDeleteProduct(${item.id})" 
                        title="Hapus produk ini">
                    <i class="fas fa-trash"></i> HAPUS
                </button>
            </div>
        </div>
    `).join('');
}

function renderStats() {
    const totalProduk = database.length;
    const totalStok = database.reduce((sum, item) => sum + item.stok, 0);
    
    // Hitung per kategori
    const kategoriStats = {};
    database.forEach(item => {
        if (!kategoriStats[item.kategori]) {
            kategoriStats[item.kategori] = { count: 0, stok: 0 };
        }
        kategoriStats[item.kategori].count++;
        kategoriStats[item.kategori].stok += item.stok;
    });
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background: #3b82f6;">
                <i class="fas fa-box"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${totalProduk}</div>
                <div class="stat-label">Total Produk</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: #10b981;">
                <i class="fas fa-boxes"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${totalStok}</div>
                <div class="stat-label">Total Stok</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: #8b5cf6;">
                <i class="fas fa-tags"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${Object.keys(kategoriStats).length}</div>
                <div class="stat-label">Kategori</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: #f59e0b;">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${database.filter(p => p.stok === 0).length}</div>
                <div class="stat-label">Stok Habis</div>
            </div>
        </div>
    `;
}

// ============================================
// STOCK MANAGEMENT
// ============================================

function changeStock(id, change) {
    const index = database.findIndex(x => x.id === id);
    if (index === -1) return;
    
    const newStock = Math.max(0, database[index].stok + change);
    const oldStock = database[index].stok;
    
    if (newStock === oldStock && change < 0) {
        showToast('❌ Stok sudah 0, tidak bisa dikurangi', 'warning');
        return;
    }
    
    database[index].stok = newStock;
    database[index].updatedAt = new Date().toISOString();
    saveToLocalStorage();
    
    // Animate stock change
    const stockElement = document.getElementById(`stock-${id}`);
    if (stockElement) {
        stockElement.textContent = newStock;
        stockElement.classList.add('changed');
        setTimeout(() => stockElement.classList.remove('changed'), 500);
        
        // Update button state
        const minusBtn = stockElement.closest('.product-card').querySelector('.stock-btn.minus');
        if (minusBtn) {
            minusBtn.disabled = newStock <= 0;
        }
    }
    
    // Show notification
    const produk = database[index];
    const icon = change > 0 ? '📈' : '📉';
    const action = change > 0 ? 'ditambahkan' : 'dikurangi';
    showToast(`${icon} Stok <strong>${produk.nama}</strong> ${action}: ${oldStock} → ${newStock}`, 'success');
    
    // Update stats
    renderStats();
}

// ============================================
// EDIT PRICE FUNCTIONS
// ============================================

function openEditPriceModal(productId) {
    const produk = database.find(x => x.id === productId);
    if (!produk) return;
    
    currentEditingProductId = productId;
    editProductName.textContent = produk.nama;
    editHargaBeli.value = produk.beli;
    editHargaJual.value = produk.jual;
    
    editPriceModal.classList.add('show');
    setTimeout(() => editHargaJual.focus(), 300);
}

function saveEditedPrice() {
    if (!currentEditingProductId) return;
    
    const newBeli = parseInt(editHargaBeli.value) || 0;
    const newJual = parseInt(editHargaJual.value);
    
    if (!newJual || newJual <= 0) {
        showToast('❌ Harga jual harus diisi!', 'error');
        editHargaJual.focus();
        return;
    }
    
    const index = database.findIndex(x => x.id === currentEditingProductId);
    if (index === -1) {
        showToast('❌ Produk tidak ditemukan', 'error');
        return;
    }
    
    const oldBeli = database[index].beli;
    const oldJual = database[index].jual;
    
    database[index].beli = newBeli;
    database[index].jual = newJual;
    database[index].updatedAt = new Date().toISOString();
    saveToLocalStorage();
    
    editPriceModal.classList.remove('show');
    currentEditingProductId = null;
    
    // Update UI
    renderData();
    
    // Show success message
    let message = `✅ Harga <strong>${database[index].nama}</strong> diupdate`;
    if (oldBeli !== newBeli || oldJual !== newJual) {
        message += ':';
        if (oldBeli !== newBeli) {
 
