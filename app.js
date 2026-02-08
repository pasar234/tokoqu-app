// VARIABEL GLOBAL UNTUK EDIT HARGA
let currentEditingProduct = null;

// FUNGSI TAMPILKAN MODAL EDIT HARGA
function showEditPriceModal(productId) {
    const produk = database.find(x => x.id === productId);
    if (!produk) return;
    
    currentEditingProduct = productId;
    
    // Buat modal HTML
    const modalHTML = `
        <div class="modal-edit-harga show" id="editPriceModal">
            <div class="modal-content-edit">
                <h3>Edit Harga Produk</h3>
                <p><strong>${escapeHtml(produk.nama)}</strong></p>
                
                <div class="edit-form-group">
                    <label for="editHargaBeli">Harga Beli (Rp)</label>
                    <input type="number" 
                           id="editHargaBeli" 
                           class="edit-form-input" 
                           value="${produk.beli}" 
                           min="0" 
                           placeholder="Masukkan harga beli"
                           onfocus="this.select()">
                </div>
                
                <div class="edit-form-group">
                    <label for="editHargaJual">Harga Jual (Rp) *</label>
                    <input type="number" 
                           id="editHargaJual" 
                           class="edit-form-input" 
                           value="${produk.jual}" 
                           min="0" 
                           placeholder="Masukkan harga jual"
                           required
                           onfocus="this.select()">
                </div>
                
                <div class="modal-actions-edit">
                    <button class="btn-edit-cancel" id="cancelEditBtn">Batal</button>
                    <button class="btn-edit-save" id="saveEditBtn">Simpan Perubahan</button>
                </div>
            </div>
        </div>
    `;
    
    // Tambahkan modal ke body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Auto-focus pada harga jual
    setTimeout(() => {
        const jualInput = document.getElementById('editHargaJual');
        if (jualInput) jualInput.focus();
    }, 300);
    
    // Event listeners untuk modal
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedPrice);
    
    // ESC untuk close modal
    document.addEventListener('keydown', handleEditModalKeydown);
    
    // Klik di luar modal untuk close
    document.getElementById('editPriceModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
}

// FUNGSI SIMPAN HARGA YANG DIEDIT
function saveEditedPrice() {
    if (!currentEditingProduct) return;
    
    const newBeli = parseInt(document.getElementById('editHargaBeli').value) || 0;
    const newJual = parseInt(document.getElementById('editHargaJual').value);
    
    // Validasi
    if (!newJual || newJual <= 0) {
        showToast('❌ Harga jual harus diisi!', 'error');
        document.getElementById('editHargaJual').focus();
        return;
    }
    
    const index = database.findIndex(x => x.id === currentEditingProduct);
    if (index !== -1) {
        // Simpan harga lama untuk notifikasi
        const hargaBeliLama = database[index].beli;
        const hargaJualLama = database[index].jual;
        
        // Update harga baru
        database[index].beli = newBeli;
        database[index].jual = newJual;
        
        saveToLocalStorage();
        renderData();
        
        // Tampilkan notifikasi perubahan
        let notif = `✅ Harga ${database[index].nama} diupdate:`;
        if (hargaBeliLama !== newBeli) {
            notif += `\nBeli: ${formatRupiah(hargaBeliLama)} → ${formatRupiah(newBeli)}`;
        }
        if (hargaJualLama !== newJual) {
            notif += `\nJual: ${formatRupiah(hargaJualLama)} → ${formatRupiah(newJual)}`;
        }
        
        showToast(notif, 'success');
    }
    
    closeEditModal();
}

// FUNGSI TUTUP MODAL EDIT
function closeEditModal() {
    const modal = document.getElementById('editPriceModal');
    if (modal) {
        modal.remove();
    }
    currentEditingProduct = null;
    document.removeEventListener('keydown', handleEditModalKeydown);
}

// FUNGSI HANDLE KEYDOWN DI MODAL EDIT
function handleEditModalKeydown(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        saveEditedPrice();
    }
}

// PERBAIKAN FUNGSI renderData() - TAMPILKAN HARGA YANG BISA DIKLIK
function renderData() {
    if (!currentCategory) return;
    
    const search = searchInput.value.toLowerCase();
    const filteredData = database.filter(item => 
        item.kategori === currentCategory && 
        (item.nama.toLowerCase().includes(search) || 
         item.kode.toLowerCase().includes(search))
    );
    
    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        listContainer.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
    
    listContainer.innerHTML = filteredData.map(item => `
        <div class="product-card" data-id="${item.id}">
            <!-- BAGIAN KIRI: INFO PRODUK -->
            <div class="product-info">
                <h3 class="product-title">${escapeHtml(item.nama)}</h3>
                
                <div class="product-details">
                    <div class="product-code">Kode: ${escapeHtml(item.kode)}</div>
                </div>
                
                <div class="product-harga-container">
                    <!-- HARGA BELI -->
                    <div class="harga-item">
                        <span class="harga-label">Beli:</span>
                        <div class="harga-value" onclick="showEditPriceModal(${item.id})" title="Klik untuk edit harga">
                            ${formatRupiah(item.beli)}
                            <i class="fas fa-edit edit-price-icon"></i>
                        </div>
                    </div>
                    
                    <!-- HARGA JUAL -->
                    <div class="harga-item">
                        <span class="harga-label">Jual:</span>
                        <div class="harga-value" onclick="showEditPriceModal(${item.id})" title="Klik untuk edit harga" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.3); background: rgba(220, 38, 38, 0.1);">
                            ${formatRupiah(item.jual)}
                            <i class="fas fa-edit edit-price-icon" style="color: #dc2626;"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- BAGIAN KANAN: STOK & HAPUS -->
            <div class="product-actions">
                <!-- KONTROL STOK -->
                <div class="stock-control">
                    <div class="stock-label">STOK</div>
                    <div class="stock-value">${item.stok}</div>
                    <div class="stock-buttons">
                        <button class="stock-btn minus" onclick="ubahStok(${item.id}, -1)" title="Kurangi stok">-</button>
                        <button class="stock-btn plus" onclick="ubahStok(${item.id}, 1)" title="Tambah stok">+</button>
                    </div>
                </div>
                
                <!-- TOMBOL HAPUS -->
                <button class="delete-btn" onclick="showDeleteConfirm(${item.id})" title="Hapus produk">
                    <i class="fas fa-trash"></i> HAPUS PRODUK
                </button>
            </div>
        </div>
    `).join('');
}

// FUNGSI ubahStok (TAMBAH/KURANGI STOK) - TAMPILKAN LEBIH BAIK
function ubahStok(id, val) {
    const index = database.findIndex(x => x.id === id);
    if (index !== -1) {
        const newStock = Math.max(0, database[index].stok + val);
        const oldStock = database[index].stok;
        database[index].stok = newStock;
        saveToLocalStorage();
        renderData();
        
        // Show stock change notification dengan animasi
        const produk = database[index];
        const action = val > 0 ? 'ditambahkan' : 'dikurangi';
        const icon = val > 0 ? '📈' : '📉';
        
        // Highlight stok yang berubah
        const productCard = document.querySelector(`.product-card[data-id="${id}"] .stock-value`);
        if (productCard) {
            productCard.style.transform = 'scale(1.2)';
            productCard.style.color = val > 0 ? '#10b981' : '#ef4444';
            setTimeout(() => {
                productCard.style.transform = 'scale(1)';
                productCard.style.color = '';
            }, 300);
        }
        
        showToast(`${icon} Stok ${produk.nama} ${action}: ${oldStock} → ${newStock}`, 'success');
    }
}
