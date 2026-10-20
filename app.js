/* ==========================================================================
   REGISTRO DEL SERVICE WORKER (v1.6.0)
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado correctamente:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}

/* ==========================================================================
   ESTADO Y BASE DE DATOS LOCAL
   ========================================================================== */
let products = JSON.parse(localStorage.getItem('inventory_products')) || [];
let activeFilter = 'all';
let cartAdjustments = {};
let wakeLock = null;
let isSuperMode = false;

const normalizeText = (text) => 
    text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const getStepForUnit = (unit) => {
    const normalizedUnit = (unit || 'ud').toLowerCase();
    if (normalizedUnit === 'g' || normalizedUnit === 'ml') {
        return 50;
    }
    return 1;
};

function saveState() {
    localStorage.setItem('inventory_products', JSON.stringify(products));
    updateStats();
    updateCartBadge();
}

/* ==========================================================================
   SISTEMA DE NOTIFICACIONES TOAST
   ========================================================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   BADGE INDICADOR EN CESTA
   ========================================================================== */
function updateCartBadge() {
    const badge = document.getElementById('badge-compra');
    const neededCount = products.filter(p => p.currentStock < p.targetStock).length;

    if (neededCount > 0) {
        badge.textContent = neededCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/* ==========================================================================
   CONTROL DE PESTAÑAS (NAVIGATION)
   ========================================================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            if (targetTab !== 'compra' && isSuperMode) {
                disableSuperMode();
            }

            if (targetTab === 'inventario') renderInventario();
            if (targetTab === 'productos') renderProductos();
            if (targetTab === 'compra') renderCompra();
            if (targetTab === 'ajustes') updateStats();
        });
    });
}

/* ==========================================================================
   FILTROS RÁPIDOS POR ESTADO
   ========================================================================== */
function initFilters() {
    const chips = document.querySelectorAll('.filter-chips .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter');
            renderInventario();
        });
    });
}

/* ==========================================================================
   GESTIÓN DE MODO SÚPER (RESTRINGIDO A LA CESTA)
   ========================================================================== */
async function toggleWakeLock(enable) {
    if ('wakeLock' in navigator && enable) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.log('Wake Lock no soportado o denegado.');
        }
    } else if (wakeLock) {
        try {
            await wakeLock.release();
        } catch (err) {
            console.log('Error al liberar Wake Lock.');
        }
        wakeLock = null;
    }
}

async function enableSuperMode() {
    isSuperMode = true;
    document.getElementById('tab-compra').classList.add('super-mode');
    document.getElementById('super-status').textContent = 'ON';
    await toggleWakeLock(true);
}

async function disableSuperMode() {
    isSuperMode = false;
    document.getElementById('tab-compra').classList.remove('super-mode');
    document.getElementById('super-status').textContent = 'OFF';
    await toggleWakeLock(false);
}

document.getElementById('btn-toggle-super').addEventListener('click', () => {
    if (isSuperMode) {
        disableSuperMode();
    } else {
        enableSuperMode();
    }
});

/* ==========================================================================
   GESTIÓN DE MODAL (CREACIÓN / EDICIÓN)
   ========================================================================== */
const modal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

function openModal(productId = null) {
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('product-id');
    const inputName = document.getElementById('product-name');
    const inputCat = document.getElementById('product-category');
    const selectUnit = document.getElementById('prod-unidad');
    const inputStock = document.getElementById('product-current-stock');
    const inputTarget = document.getElementById('product-target-stock');

    if (productId) {
        const prod = products.find(p => p.id === productId);
        if (prod) {
            modalTitle.textContent = 'Editar Producto';
            inputId.value = prod.id;
            inputName.value = prod.name;
            inputCat.value = prod.category;
            selectUnit.value = prod.unit || 'ud';
            inputStock.value = prod.currentStock;
            inputTarget.value = prod.targetStock;
        }
    } else {
        modalTitle.textContent = 'Añadir Producto';
        productForm.reset();
        selectUnit.value = 'ud';
        inputId.value = '';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    productForm.reset();
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim() || 'Otros';
    const unit = document.getElementById('prod-unidad').value || 'ud';
    const currentStock = parseFloat(document.getElementById('product-current-stock').value) || 0;
    const targetStock = parseFloat(document.getElementById('product-target-stock').value) || 1;

    if (id) {
        const prod = products.find(p => p.id === id);
        if (prod) {
            prod.name = name;
            prod.category = category;
            prod.unit = unit;
            prod.currentStock = currentStock;
            prod.targetStock = targetStock;
            showToast(`Producto "${name}" actualizado`, 'success');
        }
    } else {
        const newProduct = {
            id: Date.now().toString(),
            name,
            category,
            unit,
            currentStock,
            targetStock
        };
        products.push(newProduct);
        showToast(`Producto "${name}" creado`, 'success');
    }

    saveState();
    closeModal();

    const activeTab = document.querySelector('.nav-btn.active').getAttribute('data-tab');
    if (activeTab === 'inventario') renderInventario();
    if (activeTab === 'productos') renderProductos();
});

/* ==========================================================================
   RENDERIZADO Y BÚSQUEDA EN INVENTARIO
   ========================================================================== */
function renderInventario() {
    const list = document.getElementById('lista-inventario');
    const query = normalizeText(document.getElementById('search-inventario').value);
    list.innerHTML = '';

    let filtered = products.filter(p => 
        normalizeText(p.name).includes(query) || normalizeText(p.category).includes(query)
    );

    if (activeFilter === 'out') {
        filtered = filtered.filter(p => p.currentStock === 0);
    } else if (activeFilter === 'low') {
        filtered = filtered.filter(p => p.currentStock < p.targetStock);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<li class="empty-msg card">No hay productos que coincidan con el filtro.</li>';
        return;
    }

    filtered.forEach(p => {
        const unit = p.unit || 'ud';
        const step = getStepForUnit(unit);
        const isMinDisabled = p.currentStock <= 0 ? 'disabled' : '';

        const li = document.createElement('li');
        li.className = 'card item-row';
        li.innerHTML = `
            <div class="item-info">
                <strong class="item-title">${p.name}</strong>
                <div class="product-meta">${p.category} | Objetivo: ${p.targetStock} ${unit}</div>
            </div>
            <div class="stock-controls">
                <button class="btn-qty" onclick="changeStock('${p.id}', -${step})" ${isMinDisabled}>-</button>
                <span class="qty-badge">${p.currentStock} ${unit}</span>
                <button class="btn-qty" onclick="changeStock('${p.id}', ${step})">+</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function changeStock(id, delta) {
    const prod = products.find(p => p.id === id);
    if (prod) {
        const newStock = prod.currentStock + delta;
        if (newStock >= 0) {
            prod.currentStock = Math.round(newStock * 100) / 100;
            saveState();
            renderInventario();
        }
    }
}

/* ==========================================================================
   RENDERIZADO CON AGRUPACIÓN POR CATEGORÍAS EN PRODUCTOS
   ========================================================================== */
function renderProductos() {
    const container = document.getElementById('contenedor-productos');
    const query = normalizeText(document.getElementById('search-productos').value);
    container.innerHTML = '';

    const filtered = products.filter(p => 
        normalizeText(p.name).includes(query) || normalizeText(p.category).includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-msg card">No hay productos definidos.</div>';
        return;
    }

    const grouped = filtered.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    Object.keys(grouped).forEach(cat => {
        const groupEl = document.createElement('div');
        groupEl.className = 'category-group card';

        let itemsHtml = grouped[cat].map(p => {
            const unit = p.unit || 'ud';
            return `
                <div class="item-row inner-row">
                    <div class="item-info">
                        <strong class="item-title">${p.name}</strong>
                        <div class="product-meta">Stock: ${p.currentStock} / Obj: ${p.targetStock} ${unit}</div>
                    </div>
                    <div class="actions">
                        <button class="btn btn-secondary small" onclick="openModal('${p.id}')">Editar</button>
                        <button class="btn btn-danger small" onclick="deleteProduct('${p.id}')">Borrar</button>
                    </div>
                </div>
            `;
        }).join('');

        groupEl.innerHTML = `
            <div class="category-title">${cat}</div>
            <div class="category-items">${itemsHtml}</div>
        `;
        container.appendChild(groupEl);
    });
}

function deleteProduct(id) {
    const prod = products.find(p => p.id === id);
    if (confirm(`¿Estás seguro de eliminar "${prod ? prod.name : 'este producto'}"?`)) {
        products = products.filter(p => p.id !== id);
        saveState();
        renderProductos();
        showToast('Producto eliminado', 'warning');
    }
}

/* ==========================================================================
   RENDERIZADO Y DECREMENTO EN CESTA
   ========================================================================== */
function renderCompra() {
    const container = document.getElementById('contenedor-compra');
    container.innerHTML = '';

    const needed = products.filter(p => p.currentStock < p.targetStock);

    if (needed.length === 0) {
        container.innerHTML = '<div class="empty-msg card">¡Todo abastecido! No necesitas comprar nada.</div>';
        return;
    }

    const grouped = needed.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    Object.keys(grouped).forEach(cat => {
        const groupEl = document.createElement('div');
        groupEl.className = 'category-group card';

        let itemsHtml = grouped[cat].map(p => {
            const unit = p.unit || 'ud';
            const step = getStepForUnit(unit);
            const defaultQtyToBuy = Math.round((p.targetStock - p.currentStock) * 100) / 100;
            
            if (!(p.id in cartAdjustments)) {
                cartAdjustments[p.id] = defaultQtyToBuy;
            }

            const currentBuyVal = cartAdjustments[p.id];

            return `
                <div class="item-row inner-row shopping-item">
                    <label class="checkbox-label">
                        <input type="checkbox" class="purchase-check" data-id="${p.id}">
                        <span class="item-title">${p.name}</span>
                    </label>
                    <div class="cart-qty-adjuster">
                        <button class="btn-qty small-qty" onclick="adjustCartQty('${p.id}', -${step})">-</button>
                        <input type="number" class="cart-qty-input item-qty" value="${currentBuyVal}" min="0" step="${step}" onchange="updateCartInput('${p.id}', this.value)">
                        <span class="unit-text">${unit}</span>
                        <button class="btn-qty small-qty" onclick="adjustCartQty('${p.id}', ${step})">+</button>
                    </div>
                </div>
            `;
        }).join('');

        groupEl.innerHTML = `
            <div class="category-title">${cat}</div>
            <div class="category-items">${itemsHtml}</div>
        `;
        container.appendChild(groupEl);
    });
}

function adjustCartQty(id, delta) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const currentVal = cartAdjustments[id] !== undefined ? cartAdjustments[id] : (prod.targetStock - prod.currentStock);
    const newVal = Math.round(Math.max(0, currentVal + delta) * 100) / 100;
    
    cartAdjustments[id] = newVal;
    renderCompra();
}

function updateCartInput(id, val) {
    const numericVal = parseFloat(val);
    if (!isNaN(numericVal) && numericVal >= 0) {
        cartAdjustments[id] = Math.round(numericVal * 100) / 100;
    } else {
        cartAdjustments[id] = 0;
    }
    renderCompra();
}

document.getElementById('btn-select-all').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.purchase-check');
    checkboxes.forEach(chk => chk.checked = true);
});

document.getElementById('btn-deselect-all').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.purchase-check');
    checkboxes.forEach(chk => chk.checked = false);
});

document.getElementById('btn-finish-purchase').addEventListener('click', () => {
    const checked = document.querySelectorAll('.purchase-check:checked');
    if (checked.length === 0) {
        alert('Marca al menos un elemento comprado.');
        return;
    }

    checked.forEach(chk => {
        const id = chk.getAttribute('data-id');
        const prod = products.find(p => p.id === id);
        if (prod) {
            const addedQty = cartAdjustments[id] !== undefined ? cartAdjustments[id] : (prod.targetStock - prod.currentStock);
            prod.currentStock = Math.round((prod.currentStock + addedQty) * 100) / 100;
            delete cartAdjustments[id];
        }
    });

    saveState();
    renderCompra();
    showToast('Stock reponido con éxito', 'success');
});

/* ==========================================================================
   ESTADÍSTICAS AVANZADAS
   ========================================================================== */
function updateStats() {
    const totalProd = products.length;
    document.getElementById('stat-total-prod').textContent = totalProd;

    const lowStockCount = products.filter(p => p.currentStock < p.targetStock).length;
    document.getElementById('stat-low-stock').textContent = lowStockCount;

    if (totalProd > 0) {
        const sumCurrent = products.reduce((acc, p) => acc + p.currentStock, 0);
        const sumTarget = products.reduce((acc, p) => acc + p.targetStock, 0);
        const coverage = sumTarget > 0 ? Math.min(100, Math.round((sumCurrent / sumTarget) * 100)) : 0;
        document.getElementById('stat-coverage').textContent = `${coverage}%`;
    } else {
        document.getElementById('stat-coverage').textContent = '0%';
    }

    if (totalProd > 0) {
        const catCounts = products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});

        const topCat = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b);
        document.getElementById('stat-top-cat').textContent = topCat;
    } else {
        document.getElementById('stat-top-cat').textContent = '-';
    }
}

/* ==========================================================================
   RESPALDOS CON TIMESTAMP ISO Y EVENTOS DE CARGA
   ========================================================================== */
document.getElementById('btn-export-backup').addEventListener('click', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const fileName = `despensa_backup_${year}-${month}-${day}_${hours}${minutes}.json`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", fileName);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Copia exportada correctamente', 'info');
});

document.getElementById('file-import-backup').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                products = imported;
                saveState();
                renderInventario();
                showToast('Datos importados con éxito', 'success');
            } else {
                throw new Error('Formato no válido');
            }
        } catch (err) {
            alert('Error al importar archivo. Asegúrate de que sea un JSON válido.');
        }
    };
    reader.readAsText(file);
});

document.getElementById('btn-open-modal-inv').addEventListener('click', () => openModal());
document.getElementById('btn-open-modal-prod').addEventListener('click', () => openModal());
document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

document.getElementById('search-inventario').addEventListener('input', renderInventario);
document.getElementById('search-productos').addEventListener('input', renderProductos);

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFilters();
    updateCartBadge();
    renderInventario();
});