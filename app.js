/* ==========================================================================
   REGISTRO DEL SERVICE WORKER (v1.8.4)
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado correctamente (v1.8.4):', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}

/* ==========================================================================
   ESTADO Y BASE DE DATOS LOCAL
   ========================================================================== */
let products = JSON.parse(localStorage.getItem('inventory_products')) || [];
let categories = JSON.parse(localStorage.getItem('inventory_categories')) || [
    'Lácteos', 'Frutería y Verdura', 'Carnicería', 'Pescadería', 'Despensa / Granel', 'Bebidas', 'Limpieza', 'Otros'
];
let darkMode = JSON.parse(localStorage.getItem('inventory_darkmode')) || false;
let inventoryViewMode = localStorage.getItem('inventory_view_mode') || 'categories'; 

let activeFilter = localStorage.getItem('inventory_active_filter') || 'all'; 
let cartAdjustments = {}; 
let selectedCartIds = new Set(); 

const normalizeText = (text) => 
    text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const getStepForUnit = (unit) => {
    const normalizedUnit = (unit || 'ud').toLowerCase();
    if (normalizedUnit === 'g' || normalizedUnit === 'ml') {
        return 50;
    }
    return 1;
};

const getStockSemaphore = (current, target) => {
    if (current === 0) return { color: '🔴', label: 'Sin Stock' };
    const ratio = current / target;
    if (ratio <= 0.25) return { color: '🟠', label: 'Crítico' };
    if (ratio <= 0.50) return { color: '🟡', label: 'En Reserva' };
    return { color: '🟢', label: 'Saludable' };
};

function saveState() {
    localStorage.setItem('inventory_products', JSON.stringify(products));
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
    localStorage.setItem('inventory_darkmode', JSON.stringify(darkMode));
    localStorage.setItem('inventory_view_mode', inventoryViewMode);
    localStorage.setItem('inventory_active_filter', activeFilter);
    updateStats();
    updateCartBadge();
}

/* ==========================================================================
   MODO OSCURO Y TEMA
   ========================================================================== */
function initTheme() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

const toggleDarkModeBtn = document.getElementById('btn-toggle-darkmode');
if (toggleDarkModeBtn) {
    toggleDarkModeBtn.addEventListener('click', () => {
        darkMode = !darkMode;
        saveState();
        initTheme();
        showToast(darkMode ? 'Modo Oscuro activado' : 'Modo Claro activado', 'info');
    });
}

/* ==========================================================================
   SISTEMA DE NOTIFICACIONES TOAST
   ========================================================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
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

function updateCartBadge() {
    const badge = document.getElementById('badge-compra');
    if (!badge) return;
    const neededCount = products.filter(p => p.currentStock < p.targetStock).length;

    if (neededCount > 0) {
        badge.textContent = neededCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/* ==========================================================================
   CONTROL DE PESTAÑAS Y TOPBAR CONTEXTUAL (v1.8.4)
   ========================================================================== */
function updateTopbarContext(tabName) {
    const titleEl = document.getElementById('topbar-title');
    const actionsEl = document.getElementById('topbar-actions');
    if (!titleEl || !actionsEl) return;

    actionsEl.innerHTML = '';

    if (tabName === 'inventario') {
        titleEl.textContent = '📋 Inventario';
        
        // Botón Cambiar Vista y Botón + Nuevo integrados en la franja superior azul
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-secondary small';
        viewBtn.innerHTML = `🔀 <span id="view-mode-label">${inventoryViewMode === 'categories' ? 'Categorías' : 'Alfabética'}</span>`;
        viewBtn.onclick = () => {
            inventoryViewMode = inventoryViewMode === 'categories' ? 'alphabetical' : 'categories';
            saveState();
            renderInventario();
            showToast(`Vista cambiada a ${inventoryViewMode === 'categories' ? 'Pasillos' : 'Alfabética A-Z'}`, 'info');
        };
        actionsEl.appendChild(viewBtn);

        const newInvBtn = document.createElement('button');
        newInvBtn.className = 'btn btn-secondary small'; 
        newInvBtn.textContent = '+ Nuevo';
        newInvBtn.onclick = () => openModal();
        actionsEl.appendChild(newInvBtn);

    } else if (tabName === 'compra') {
        titleEl.textContent = '🛒 Lista de Compra';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-secondary small';
        copyBtn.textContent = '📋 Copiar';
        copyBtn.onclick = copyShoppingListToClipboard;
        actionsEl.appendChild(copyBtn);

        const compactBtn = document.createElement('button');
        compactBtn.className = 'btn btn-super-toggle small';
        compactBtn.textContent = '🖥️ Compacto';
        compactBtn.onclick = openCompactMode;
        actionsEl.appendChild(compactBtn);
    } else if (tabName === 'productos') {
        titleEl.textContent = '🏷️ Catálogo de Productos';
        
        const newProdBtn = document.createElement('button');
        newProdBtn.className = 'btn btn-secondary small';
        newProdBtn.textContent = '+ Nuevo';
        newProdBtn.onclick = () => openModal();
        actionsEl.appendChild(newProdBtn);

    } else if (tabName === 'ajustes') {
        titleEl.textContent = '⚙️ Ajustes';
    }
}

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

            updateTopbarContext(targetTab);

            if (targetTab === 'inventario') renderInventario();
            if (targetTab === 'productos') renderProductos();
            if (targetTab === 'compra') renderCompra();
            if (targetTab === 'ajustes') {
                updateStats();
                renderCategoriesManager();
            }
        });
    });
    updateTopbarContext('inventario');
}

/* ==========================================================================
   REASIGNACIÓN Y ORDEN ALFABÉTICO EN SELECTORES DE PASILLOS
   ========================================================================== */
function renderCategoriesManager() {
    const container = document.getElementById('categories-list-container');
    if (!container) return;
    container.innerHTML = '';

    categories.forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'category-tag-item';
        tag.innerHTML = `
            <span>${cat}</span>
            ${categories.length > 1 ? `<button class="btn-del-cat" onclick="deleteCategory('${cat}')">×</button>` : ''}
        `;
        container.appendChild(tag);
    });

    updateCategorySelects();
}

function updateCategorySelects() {
    const select = document.getElementById('product-category');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';

    const sortedCategories = [...categories].sort((a, b) => {
        if (a === 'Otros') return 1;
        if (b === 'Otros') return -1;
        return a.localeCompare(b);
    });

    sortedCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    if (categories.includes(currentVal)) {
        select.value = currentVal;
    }
}

const addCatBtn = document.getElementById('btn-add-category');
if (addCatBtn) {
    addCatBtn.addEventListener('click', () => {
        const input = document.getElementById('new-category-input');
        if (!input) return;
        const val = input.value.trim();
        if (!val) return;
        if (categories.includes(val)) {
            alert('Este pasillo ya existe.');
            return;
        }
        categories.push(val);
        input.value = '';
        saveState();
        renderCategoriesManager();
        showToast(`Pasillo "${val}" añadido`, 'success');
    });
}

function deleteCategory(catName) {
    if (categories.length <= 1) {
        alert('Debe existir al menos un pasillo.');
        return;
    }
    if (confirm(`¿Eliminar pasillo "${catName}"? Los productos asignados pasarán automáticamente a "Otros".`)) {
        categories = categories.filter(c => c !== catName);
        if (!categories.includes('Otros')) categories.push('Otros');
        
        products.forEach(p => {
            if (p.category === catName) {
                p.category = 'Otros';
            }
        });

        saveState();
        renderCategoriesManager();
        renderInventario();
        showToast('Pasillo eliminado y productos reasignados a Otros', 'warning');
    }
}

/* ==========================================================================
   FILTROS CROMÁTICOS POR UMBRAL ACUMULATIVO (v1.8.4)
   ========================================================================== */
function initFilters() {
    const chips = document.querySelectorAll('.filter-chips .chip');
    
    chips.forEach(chip => {
        const filterVal = chip.getAttribute('data-filter');
        if (filterVal === activeFilter) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }

        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = filterVal;
            saveState();
            renderInventario();
        });
    });
}

function setupSearchWithClear(inputId, clearBtnId, renderCallback) {
    const input = document.getElementById(inputId);
    const clearBtn = document.getElementById(clearBtnId);
    if (!input || !clearBtn) return;

    input.addEventListener('input', () => {
        if (input.value.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        renderCallback();
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        renderCallback();
        input.focus();
    });
}

function renderInventario() {
    const container = document.getElementById('lista-inventario-container');
    const searchInput = document.getElementById('search-inventario');
    const viewLabel = document.getElementById('view-mode-label');
    if (!container) return;

    if (viewLabel) {
        viewLabel.textContent = inventoryViewMode === 'categories' ? 'Categorías' : 'Alfabética';
    }

    const query = normalizeText(searchInput ? searchInput.value : '');
    container.innerHTML = '';

    let filtered = products.filter(p => 
        normalizeText(p.name).includes(query) || normalizeText(p.category).includes(query)
    );

    // Lógica de Filtros por Umbral Acumulativo (v1.8.4)
    if (activeFilter === 'red') {
        // 0%: Solo agotados
        filtered = filtered.filter(p => p.currentStock === 0);
    } else if (activeFilter === 'orange') {
        // <25%: Agotados + crítico (ratio <= 0.25)
        filtered = filtered.filter(p => {
            if (p.currentStock === 0) return true;
            return (p.currentStock / p.targetStock) <= 0.25;
        });
    } else if (activeFilter === 'yellow') {
        // <50%: Agotados + crítico + reserva (ratio <= 0.50)
        filtered = filtered.filter(p => {
            if (p.currentStock === 0) return true;
            return (p.currentStock / p.targetStock) <= 0.50;
        });
    } else if (activeFilter === 'green') {
        // >50%: Saludable (ratio > 0.50)
        filtered = filtered.filter(p => {
            if (p.currentStock === 0) return false;
            return (p.currentStock / p.targetStock) > 0.50;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-msg card">No hay productos que coincidan con el filtro seleccionado.</div>';
        return;
    }

    if (inventoryViewMode === 'alphabetical') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        const ul = document.createElement('ul');
        ul.className = 'item-list';

        filtered.forEach(p => {
            ul.appendChild(createProductListItem(p));
        });
        container.appendChild(ul);
    } else {
        const grouped = filtered.reduce((acc, p) => {
            acc[p.category] = acc[p.category] || [];
            acc[p.category].push(p);
            return acc;
        }, {});

        Object.keys(grouped).sort().forEach(cat => {
            grouped[cat].sort((a, b) => a.name.localeCompare(b.name));

            const groupEl = document.createElement('div');
            groupEl.className = 'category-group card';

            let itemsHtml = grouped[cat].map(p => {
                const unit = p.unit || 'ud';
                const step = getStepForUnit(unit);
                const isMinDisabled = p.currentStock <= 0 ? 'disabled' : '';
                const semaphore = getStockSemaphore(p.currentStock, p.targetStock);

                return `
                    <div class="item-row inner-row">
                        <div class="item-info">
                            <strong class="item-title"><span class="stock-semaphore" title="${semaphore.label}">${semaphore.color}</span> ${p.name}</strong>
                            <div class="product-meta">Objetivo: ${p.targetStock} ${unit}</div>
                        </div>
                        <div class="stock-controls">
                            <button class="btn-qty" onclick="changeStock('${p.id}', -${step})" ${isMinDisabled}>-</button>
                            <span class="qty-badge">${p.currentStock} ${unit}</span>
                            <button class="btn-qty" onclick="changeStock('${p.id}', ${step})">+</button>
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
}

function createProductListItem(p) {
    const unit = p.unit || 'ud';
    const step = getStepForUnit(unit);
    const isMinDisabled = p.currentStock <= 0 ? 'disabled' : '';
    const semaphore = getStockSemaphore(p.currentStock, p.targetStock);

    const li = document.createElement('li');
    li.className = 'card item-row';
    li.innerHTML = `
        <div class="item-info">
            <strong class="item-title"><span class="stock-semaphore" title="${semaphore.label}">${semaphore.color}</span> ${p.name}</strong>
            <div class="product-meta">${p.category} | Objetivo: ${p.targetStock} ${unit}</div>
        </div>
        <div class="stock-controls">
            <button class="btn-qty" onclick="changeStock('${p.id}', -${step})" ${isMinDisabled}>-</button>
            <span class="qty-badge">${p.currentStock} ${unit}</span>
            <button class="btn-qty" onclick="changeStock('${p.id}', ${step})">+</button>
        </div>
    `;
    return li;
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
   RENDERIZADO DE PRODUCTOS EN CATÁLOGO
   ========================================================================== */
function renderProductos() {
    const container = document.getElementById('contenedor-productos');
    const searchInput = document.getElementById('search-productos');
    if (!container) return;
    const query = normalizeText(searchInput ? searchInput.value : '');
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
   RENDERIZADO DE CESTA DE LA COMPRA
   ========================================================================== */
function renderCompra() {
    const container = document.getElementById('contenedor-compra');
    if (!container) return;
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
            const isChecked = selectedCartIds.has(p.id) ? 'checked' : '';

            return `
                <div class="item-row inner-row shopping-item">
                    <label class="checkbox-label">
                        <input type="checkbox" class="purchase-check" data-id="${p.id}" ${isChecked} onchange="handleCartCheck(this)">
                        <span class="item-title">${p.name}</span>
                    </label>
                    <div class="cart-qty-adjuster">
                        <button class="btn-qty small" onclick="adjustCartQty('${p.id}', -${step})">-</button>
                        <input type="number" class="cart-qty-input item-qty" value="${currentBuyVal}" min="0" step="${step}" onchange="updateCartInput('${p.id}', this.value)">
                        <span class="unit-text">${unit}</span>
                        <button class="btn-qty small" onclick="adjustCartQty('${p.id}', ${step})">+</button>
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

function handleCartCheck(checkbox) {
    const id = checkbox.getAttribute('data-id');
    if (checkbox.checked) {
        selectedCartIds.add(id);
    } else {
        selectedCartIds.delete(id);
    }
    if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch (e) {} }
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

const selectAllBtn = document.getElementById('btn-select-all');
if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.purchase-check');
        checkboxes.forEach(chk => {
            chk.checked = true;
            selectedCartIds.add(chk.getAttribute('data-id'));
        });
        if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e) {} }
    });
}

const deselectAllBtn = document.getElementById('btn-deselect-all');
if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.purchase-check');
        checkboxes.forEach(chk => chk.checked = false);
        selectedCartIds.clear();
        if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e) {} }
    });
}

const finishPurchaseBtn = document.getElementById('btn-finish-purchase');
if (finishPurchaseBtn) {
    finishPurchaseBtn.addEventListener('click', () => {
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
                selectedCartIds.delete(id);
            }
        });

        saveState();
        renderCompra();
        showToast('stock repuesto con éxito', 'success');
    });
}

/* ==========================================================================
   MODO LISTA COMPACTA (PANTALLA COMPLETA)
   ========================================================================== */
const compactOverlay = document.getElementById('compact-mode-overlay');
const exitCompactBtn = document.getElementById('btn-exit-compact');

if (exitCompactBtn) {
    exitCompactBtn.addEventListener('click', () => {
        closeCompactMode();
    });
}

function openCompactMode() {
    if (compactOverlay) compactOverlay.classList.remove('hidden');
    renderCompactList();
}

function closeCompactMode() {
    if (compactOverlay) compactOverlay.classList.add('hidden');
    renderCompra();
}

function renderCompactList() {
    const overlayBody = document.getElementById('compact-overlay-body');
    if (!overlayBody) return;
    overlayBody.innerHTML = '';

    const needed = products.filter(p => p.currentStock < p.targetStock);

    if (needed.length === 0) {
        overlayBody.innerHTML = '<div class="empty-msg card">¡Todo abastecido! No necesitas comprar nada.</div>';
        return;
    }

    const grouped = needed.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    Object.keys(grouped).forEach(cat => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'compact-section-table';

        let rowsHtml = grouped[cat].map(p => {
            const unit = p.unit || 'ud';
            const qty = cartAdjustments[p.id] !== undefined ? cartAdjustments[p.id] : Math.round((p.targetStock - p.currentStock) * 100) / 100;
            const isChecked = selectedCartIds.has(p.id) ? 'checked' : '';
            const checkedClass = isChecked ? 'compact-row-checked' : '';

            return `
                <div class="compact-table-row ${checkedClass}" onclick="toggleCompactCheck('${p.id}')">
                    <div class="compact-col-check">
                        <input type="checkbox" class="compact-overlay-check" data-id="${p.id}" ${isChecked} onclick="event.stopPropagation(); handleCompactCheckClick('${p.id}', this)">
                    </div>
                    <div class="compact-col-name">${p.name}</div>
                    <div class="compact-col-qty">${qty} ${unit}</div>
                </div>
            `;
        }).join('');

        sectionEl.innerHTML = `
            <div class="compact-section-title">📂 Pasillo: ${cat}</div>
            <div class="compact-table-container">
                ${rowsHtml}
            </div>
        `;
        overlayBody.appendChild(sectionEl);
    });
}

function handleCompactCheckClick(id, checkbox) {
    if (checkbox.checked) {
        selectedCartIds.add(id);
    } else {
        selectedCartIds.delete(id);
    }
    if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
    renderCompactList();
}

function toggleCompactCheck(id) {
    if (selectedCartIds.has(id)) {
        selectedCartIds.delete(id);
    } else {
        selectedCartIds.add(id);
    }
    if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
    renderCompactList();
}

/* ==========================================================================
   COPIAR LISTA AL PORTAPAPELES
   ========================================================================== */
function copyShoppingListToClipboard() {
    const needed = products.filter(p => p.currentStock < p.targetStock);
    if (needed.length === 0) {
        showToast('La lista de la compra está vacía', 'warning');
        return;
    }

    const grouped = needed.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    let textToCopy = "🛒 LISTA DE LA COMPRA - MI DESPENSA\n\n";
    Object.keys(grouped).forEach(cat => {
        textToCopy += `[ ${cat.toUpperCase()} ]\n`;
        grouped[cat].forEach(p => {
            const qty = cartAdjustments[p.id] !== undefined ? cartAdjustments[p.id] : Math.round((p.targetStock - p.currentStock) * 100) / 100;
            const unit = p.unit || 'ud';
            const isMarked = selectedCartIds.has(p.id) ? '✓ ' : '• ';
            textToCopy += `${isMarked}${p.name}: ${qty} ${unit}\n`;
        });
        textToCopy += "\n";
    });

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        showToast('Copiado al portapapeles', 'success');
    }).catch(err => {
        alert('No se pudo copiar al portapapeles.');
    });
}

/* ==========================================================================
   ESTADÍSTICAS Y MODAL
   ========================================================================== */
function updateStats() {
    const totalProd = products.length;
    const totalProdEl = document.getElementById('stat-total-prod');
    if (totalProdEl) totalProdEl.textContent = totalProd;

    const lowStockCount = products.filter(p => p.currentStock < p.targetStock).length;
    const lowStockEl = document.getElementById('stat-low-stock');
    if (lowStockEl) lowStockEl.textContent = lowStockCount;

    const coverageEl = document.getElementById('stat-coverage');
    if (totalProd > 0) {
        const sumCurrent = products.reduce((acc, p) => acc + p.currentStock, 0);
        const sumTarget = products.reduce((acc, p) => acc + p.targetStock, 0);
        const coverage = sumTarget > 0 ? Math.min(100, Math.round((sumCurrent / sumTarget) * 100)) : 0;
        if (coverageEl) coverageEl.textContent = `${coverage}%`;
    } else {
        if (coverageEl) coverageEl.textContent = '0%';
    }

    const topCatEl = document.getElementById('stat-top-cat');
    if (totalProd > 0) {
        const catCounts = products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});

        const topCat = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b);
        if (topCatEl) topCatEl.textContent = topCat;
    } else {
        if (topCatEl) topCatEl.textContent = '-';
    }
}

const modal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

function openModal(productId = null) {
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('product-id');
    const inputName = document.getElementById('product-name');
    const selectCat = document.getElementById('product-category');
    const selectUnit = document.getElementById('prod-unidad');
    const inputStock = document.getElementById('product-current-stock');
    const inputTarget = document.getElementById('product-target-stock');

    updateCategorySelects();

    if (productId) {
        const prod = products.find(p => p.id === productId);
        if (prod) {
            if (modalTitle) modalTitle.textContent = 'Editar Producto';
            if (inputId) inputId.value = prod.id;
            if (inputName) inputName.value = prod.name;
            if (selectCat) selectCat.value = prod.category;
            if (selectUnit) selectUnit.value = prod.unit || 'ud';
            if (inputStock) inputStock.value = prod.currentStock;
            if (inputTarget) inputTarget.value = prod.targetStock;
        }
    } else {
        if (modalTitle) modalTitle.textContent = 'Añadir Producto';
        if (productForm) productForm.reset();
        if (selectUnit) selectUnit.value = 'ud';
        if (inputId) inputId.value = '';
    }

    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (productForm) productForm.reset();
}

if (productForm) {
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

        const activeTabBtn = document.querySelector('.nav-btn.active');
        const activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'inventario';
        if (activeTab === 'inventario') renderInventario();
        if (activeTab === 'productos') renderProductos();
    });
}

const closeModalBtn = document.getElementById('btn-close-modal');
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
const cancelModalBtn = document.getElementById('btn-cancel-modal');
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initFilters();
    updateCartBadge();
    renderInventario();

    setupSearchWithClear('search-inventario', 'clear-search-inventario', renderInventario);
    setupSearchWithClear('search-productos', 'clear-search-productos', renderProductos);
});