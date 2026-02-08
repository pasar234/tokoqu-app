// ============================================
// APLIKASI STOK PINTAR - KODULAR COMPATIBLE
// ============================================

// DATABASE
let database = JSON.parse(localStorage.getItem('stok_app_db')) || [];
let currentCategory = '';
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

// MODALS
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

// UI
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const installBtn = document.getElementById('installBtn');
const statsContainer = document.getElementById('statsContainer');

// ============================================
// KODULAR FIX - MANUAL EVENT BINDING
// ============================================

function initializeKodularFix() {
    console.log('🔧 Initializing Kodular Fix...');
    
    // ===== NAVIGATION BUTTONS =====
    navBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const page = this.getAttribute('data-page');
            console.log('Navigating to:', page);
            
            // Update active state
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show page
            if (page === 'home') {
                pageHome.classList.add('active');
                pageList.classList.remove('active');
                document.getElementById('nama').focus();
                renderStats();
            } else {
                currentCategory = page;
                pageHome.classList.remove('active');
                pageList.classList.add('active');
                
                const categoryNames = {
                    'narita': 'NARITA',
                    'vr': 'VR', 
                    'kudus': 'KUDUS',
                    'lain': 'LAIN'
                };
                categoryTitle.innerHTML = `<i class="fas fa-box"></i> Produk ${categoryNames[page]}`;
                
                renderData();
            }
        });
    });
    
    // ===== SIMPAN PRODUK =====
    const simpanBtn = document.getElementById('simpanProduk');
    if (simpanBtn) {
        simpanBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Simpan Produk clicked');
            simpanData();
        });
        
        // Enter key support
        document.getElementById('nama').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') document.getElementById('jual').focus();
        });
        
        document.getElementById('jual').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') simpanData();
        });
    }
    
    // ===== BACKUP DATA =====
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Backup clicked');
            exportData();
        });
    }
    
    // ===== HAPUS SEMUA DATA =====
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clear Data clicked');
            
            if (confirm('HAPUS SEMUA DATA? Semua produk akan dihapus permanen!')) {
                database = [];
                localStorage.removeItem('stok_app_db');
                showToast('🗑️ Semua data berhasil dihapus', 'success');
                
                if (pageList.classList.contains('active')) {
                    renderData();
                }
                
                renderStats();
            }
        });
    }
    
    // ===== MODAL BUTTONS =====
    confirmCancel.addEventListener('click', () => confirmModal.classList.remove('show'));
    confirmOk.addEventListener('click', handleConfirmDelete);
    cancelEditBtn.addEventListener('click', () => {
        editPriceModal.classList.remove('show');
        currentEditingProductId = null;
    });
    saveEditBtn.addEventListener('click', saveEditedPrice);
    
    // ===== THEME TOGGLE =====
    themeToggle.addEventListener('click', toggleTheme);
    
    // ===== SEARCH =====
    searchInput.addEventListener('input', renderData);
    
    // ===== FILE IMPORT =====
    document.getElementById('fileInput').addEventListener('change', importData);
    
    console.log('✅ Kodular Fix Initialized');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplikasi Stok Pintar dimuat');
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Apply Kodular fixes
    initializeKodularFix();
    
    // Initial render
    renderStats();
    
    // PWA support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(console.error);
    }
    
    // Show ready message
    setTimeout(() => {
        showToast('✅ Aplikasi siap digunakan!', 'success');
    }, 1500);
});

// ============================================
// THEME FUNCTIONS
// ============================================

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
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function simpanData() {
    const nama = document.getElementById('nama').value.trim();
    const kode = document.getElementById('kode').value.trim();
    const beli = document.getElementById('beli').value;
    const jual = document.getElementById('jual').value;
    const kategori = document.getElementById('kategori').value;
    
    // Validation
    if (!nama) {
        showToast('❌ Nama produk harus diisi!', 'error');
        document.getElementById('nama').focus();
        return;
    }
    
    if (!jual || parseInt(jual) <= 0) {
        showToast('❌ Harga jual harus diisi!', 'error');
        document.getElementById('jual').focus();
        return;
    }
    
    // Create new product
    const produkBaru = {
        id: Date.now(),
        nama: nama,
        kode: kode || generateProductCode(nama),
        beli: parseInt(beli) || 0,
        jual: parseInt(jual),
        kategori: kategori,
        stok: 0,
        createdAt: new Date().toISOString()
    };
    
    database.push(produkBaru);
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('nama').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('beli').value = '0';
    document.getElementById('jual').value = '';
    document.getElementById('nama').focus();
    
    showToast(`✅ "${nama}" ditambahkan ke ${kategori}`, 'success');
    renderStats();
    
    // Auto switch to category
    if (pageList.classList.contains('active') && currentCategory === kategori) {
        renderData();
    }
}

function generateProductCode(nama) {
    const words = nama.toUpperCase().split(' ');
    let code = '';
    
    if (words.length === 1) {
        code = words[0].substring(0, 3);
    } else {
        words.forEach(word => {
            if (word.length > 0) code += word[0];
        });
    }
    
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
    
    // Update count
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
                <p>Tidak ada produk yang sesuai dengan pencarian</p>
            `;
        }
        return;
    }
    
    emptyState.style.display = 'none';
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
                        <div class="harga-value beli" onclick="openEditPriceModal(${item.id})">
                            ${formatRupiah(item.beli)}
                            <i class="fas fa-edit edit-icon"></i>
                        </div>
                    </div>
                    
                    <div class="price-row">
                        <span class="price-label">Jual:</span>
                        <div class="harga-value jual" onclick="openEditPriceModal(${item.id})">
                            ${formatRupiah(item.jual)}
                            <i class="fas fa-edit edit-icon"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- RIGHT: Stock Control & Actions -->
            <div class="product-actions">
                <div class="stock-control">
                    <div class="stock-header">
                        <span class="stock-label">STOK</span>
                        <span class="stock-value" id="stock-${item.id}">${item.stok}</span>
                    </div>
                    <div class="stock-buttons">
                        <button class="stock-btn minus" onclick="changeStock(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="stock-btn plus" onclick="changeStock(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <button class="delete-btn" onclick="confirmDeleteProduct(${item.id})">
                    <i class="fas fa-trash"></i> HAPUS
                </button>
            </div>
        </div>
    `).join('');
}

function renderStats() {
    const totalProduk = database.length;
    const totalStok = database.reduce((sum, item) => sum + item.stok, 0);
    const kategoriCount = new Set(database.map(item => item.kategori)).size;
    const stokHabis = database.filter(p => p.stok === 0).length;
    
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
                <div class="stat-value">${kategoriCount}</div>
                <div class="stat-label">Kategori</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: #f59e0b;">
                <i class="fas fa-exclamation"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stokHabis}</div>
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
    saveToLocalStorage();
    
    // Update UI
    const stockElement = document.getElementById(`stock-${id}`);
    if (stockElement) {
        stockElement.textContent = newStock;
        stockElement.classList.add('changed');
        setTimeout(() => stockElement.classList.remove('changed'), 500);
    }
    
    // Show notification
    const produk = database[index];
    const icon = change > 0 ? '📈' : '📉';
    const action = change > 0 ? 'ditambahkan' : 'dikurangi';
    showToast(`${icon} Stok ${produk.nama} ${action}: ${oldStock} → ${newStock}`, 'success');
    
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
    if (index === -1) return;
    
    database[index].beli = newBeli;
    database[index].jual = newJual;
    saveToLocalStorage();
    
    editPriceModal.classList.remove('show');
    currentEditingProductId = null;
    
    renderData();
    showToast('✅ Harga berhasil diupdate', 'success');
}

// ============================================
// DELETE PRODUCT FUNCTIONS
// ============================================

function confirmDeleteProduct(id) {
    const produk = database.find(x => x.id === id);
    if (!produk) return;
    
    currentEditingProductId = id;
    confirmTitle.innerHTML = `<i class="fas fa-trash"></i> Hapus Produk`;
    confirmMessage.innerHTML = `Yakin hapus produk <strong>"${produk.nama}"</strong>?<br>
                               <small>Kode: ${produk.kode}</small>`;
    confirmModal.classList.add('show');
}

function handleConfirmDelete() {
    if (!currentEditingProductId) return;
    
    const produk = database.find(x => x.id === currentEditingProductId);
    if (!produk) return;
    
    database = database.filter(x => x.id !== currentEditingProductId);
    saveToLocalStorage();
    
    confirmModal.classList.remove('show');
    showToast(`🗑️ Produk "${produk.nama}" dihapus`, 'success');
    
    renderData();
    renderStats();
    currentEditingProductId = null;
}

// ============================================
// DATA IMPORT/EXPORT
// ============================================

function exportData() {
    if (database.length === 0) {
        showToast('❌ Tidak ada data untuk dibackup!', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(database, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_stok_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('✅ Backup berhasil didownload!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) {
                throw new Error('Format file tidak valid');
            }
            
            if (confirm(`Akan mengimpor ${importedData.length} produk. Data lama akan ditimpa. Lanjutkan?`)) {
                database = importedData;
                saveToLocalStorage();
                showToast(`✅ ${importedData.length} produk diimpor!`, 'success');
                
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        } catch (err) {
            showToast('❌ Gagal mengimpor data', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function saveToLocalStorage() {
    localStorag
