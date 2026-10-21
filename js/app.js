/* ==========================================================================
   ORQUESTADOR PRINCIPAL ES6 Y NAVEGACIÓN GLOBAL (v2.0 Estable)
   ========================================================================== */
import { initDB, getState, saveDB, exportBackup, importBackup } from './db.js';
import { renderInventario, renderProductos } from './inventory.js';
import { renderCompra, initCartGlobalButtons, openCompactMode, closeCompactMode, copyShoppingListToClipboard } from './shopping.js';
import { renderRecetas } from './recipes.js';
import { renderPlanner } from './planner.js';

/* REGISTRO DE SERVICE WORKER */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker v2.0 Estable registrado:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function showCustomConfirm(title, message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-msg');
    const okBtn = document.getElementById('btn-confirm-ok');
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    if (!modal) {
        if (confirm(message)) onConfirm();
        return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    modal.classList.remove('hidden');

    const handleOk = () => { cleanup(); onConfirm(); };
    const handleCancel = () => { cleanup(); };
    const cleanup = () => {
        modal.classList.add('hidden');
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
}

export function initTheme() {
    const state = getState();
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

export function updateCartBadge() {
    const badge = document.getElementById('badge-compra');
    if (!badge) return;
    const state = getState();
    const neededCount = state.products.filter(p => p.currentStock < p.targetStock).length;

    if (neededCount > 0) {
        badge.textContent = neededCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function updateTopbarContext(tabName) {
    const titleEl = document.getElementById('topbar-title');
    const actionsEl = document.getElementById('topbar-actions');
    if (!titleEl || !actionsEl) return;

    actionsEl.innerHTML = '';
    const state = getState();

    if (tabName === 'inventario') {
        titleEl.textContent = '📋 Inventario';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-secondary small';
        viewBtn.innerHTML = `🔀 <span id="view-mode-label">${state.inventoryViewMode === 'categories' ? 'Categorías' : 'Alfabética'}</span>`;
        viewBtn.onclick = () => {
            state.inventoryViewMode = state.inventoryViewMode === 'categories' ? 'alphabetical' : 'categories';
            saveDB();
            renderInventario();
            showToast(`Vista cambiada a ${state.inventoryViewMode === 'categories' ? 'Pasillos' : 'Alfabética A-Z'}`, 'info');
        };
        actionsEl.appendChild(viewBtn);

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

    } else if (tabName === 'recetas') {
        titleEl.textContent = '🍳 Recetario v2.0';
    } else if (tabName === 'planificador') {
        titleEl.textContent = '📅 Planificador Semanal';
    } else if (tabName === 'ajustes') {
        titleEl.textContent = '⚙️ Ajustes';
    }
}

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.onclick = () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            updateTopbarContext(targetTab);

            if (targetTab === 'inventario') renderInventario();
            if (targetTab === 'compra') renderCompra();
            if (targetTab === 'productos') renderProductos();
            if (targetTab === 'recetas') renderRecetas();
            if (targetTab === 'planificador') renderPlanner();
            if (targetTab === 'ajustes') {
                updateStats();
                renderCategoriesManager();
                loadApiKeyInput();
            }
        };
    });
    updateTopbarContext('inventario');
}

const modal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

function openModal(productId = null) {
    const state = getState();
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('product-id');
    const inputName = document.getElementById('product-name');
    const selectCat = document.getElementById('product-category');
    const selectUnit = document.getElementById('prod-unidad');
    const inputStock = document.getElementById('product-current-stock');
    const inputTarget = document.getElementById('product-target-stock');

    updateCategorySelects();

    if (productId) {
        const prod = state.products.find(p => p.id === productId);
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

function updateCategorySelects() {
    const state = getState();
    const select = document.getElementById('product-category');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';

    const sortedCategories = [...state.categories].sort((a, b) => {
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

    if (state.categories.includes(currentVal)) {
        select.value = currentVal;
    }
}

function renderCategoriesManager() {
    const container = document.getElementById('categories-list-container');
    if (!container) return;
    container.innerHTML = '';
    const state = getState();

    const sortedCategories = [...state.categories].sort((a, b) => {
        if (a === 'Otros') return 1;
        if (b === 'Otros') return -1;
        return a.localeCompare(b);
    });

    sortedCategories.forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'category-tag-item';
        tag.innerHTML = `
            <span>${cat}</span>
            ${state.categories.length > 1 ? `<button class="btn-del-cat" data-del-cat="${cat}">×</button>` : ''}
        `;
        container.appendChild(tag);
    });

    container.querySelectorAll('button[data-del-cat]').forEach(btn => {
        btn.onclick = () => {
            const catName = btn.getAttribute('data-del-cat');
            showCustomConfirm(
                'Eliminar Pasillo',
                `¿Eliminar pasillo "${catName}"? Los productos asignados pasarán automáticamente a "Otros".`,
                () => {
                    state.categories = state.categories.filter(c => c !== catName);
                    if (!state.categories.includes('Otros')) state.categories.push('Otros');
                    state.products.forEach(p => { if (p.category === catName) p.category = 'Otros'; });
                    saveDB();
                    renderCategoriesManager();
                    renderInventario();
                    showToast('Pasillo eliminado', 'warning');
                }
            );
        };
    });

    updateCategorySelects();
}

function updateStats() {
    const state = getState();
    const totalProd = state.products.length;
    const totalProdEl = document.getElementById('stat-total-prod');
    if (totalProdEl) totalProdEl.textContent = totalProd;

    const lowStockCount = state.products.filter(p => p.currentStock < p.targetStock).length;
    const lowStockEl = document.getElementById('stat-low-stock');
    if (lowStockEl) lowStockEl.textContent = lowStockCount;

    const coverageEl = document.getElementById('stat-coverage');
    if (totalProd > 0) {
        const sumCurrent = state.products.reduce((acc, p) => acc + p.currentStock, 0);
        const sumTarget = state.products.reduce((acc, p) => acc + p.targetStock, 0);
        const coverage = sumTarget > 0 ? Math.min(100, Math.round((sumCurrent / sumTarget) * 100)) : 0;
        if (coverageEl) coverageEl.textContent = `${coverage}%`;
    } else {
        if (coverageEl) coverageEl.textContent = '0%';
    }

    const topCatEl = document.getElementById('stat-top-cat');
    if (totalProd > 0) {
        const catCounts = state.products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        const topCat = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b);
        if (topCatEl) topCatEl.textContent = topCat;
    } else {
        if (topCatEl) topCatEl.textContent = '-';
    }
}

function loadApiKeyInput() {
    const input = document.getElementById('input-gemini-key');
    if (input) {
        input.value = localStorage.getItem('gemini_api_key') || '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDB();
    initTheme();
    initNavigation();
    initCartGlobalButtons();
    updateCartBadge();
    renderInventario();

    setupSearch('search-inventario', 'clear-search-inventario', renderInventario);
    setupSearch('search-productos', 'clear-search-productos', renderProductos);

    const chips = document.querySelectorAll('.filter-chips .chip');
    const state = getState();
    chips.forEach(chip => {
        if (chip.getAttribute('data-filter') === state.activeFilter) chip.classList.add('active');
        else chip.classList.remove('active');

        chip.onclick = () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.activeFilter = chip.getAttribute('data-filter');
            saveDB();
            renderInventario();
        };
    });

    const darkToggle = document.getElementById('btn-toggle-darkmode');
    if (darkToggle) {
        darkToggle.onclick = () => {
            state.darkMode = !state.darkMode;
            saveDB();
            initTheme();
            showToast(state.darkMode ? 'Modo Oscuro activado' : 'Modo Claro activado', 'info');
        };
    }

    // Guardar API Key de Gemini en localStorage
    const saveKeyBtn = document.getElementById('btn-save-gemini-key');
    if (saveKeyBtn) {
        saveKeyBtn.onclick = () => {
            const input = document.getElementById('input-gemini-key');
            if (input) {
                const keyVal = input.value.trim();
                localStorage.setItem('gemini_api_key', keyVal);
                showToast('API Key de Gemini guardada correctamente', 'success');
            }
        };
    }

    if (productForm) {
        productForm.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id').value;
            const name = document.getElementById('product-name').value.trim();
            const category = document.getElementById('product-category').value.trim() || 'Otros';
            const unit = document.getElementById('prod-unidad').value || 'ud';
            const currentStock = parseFloat(document.getElementById('product-current-stock').value) || 0;
            const targetStock = parseFloat(document.getElementById('product-target-stock').value) || 1;

            if (id) {
                const prod = state.products.find(p => p.id === id);
                if (prod) {
                    prod.name = name; prod.category = category; prod.unit = unit;
                    prod.currentStock = currentStock; prod.targetStock = targetStock;
                    showToast(`Producto "${name}" actualizado`, 'success');
                }
            } else {
                state.products.push({ id: Date.now().toString(), name, category, unit, currentStock, targetStock });
                showToast(`Producto "${name}" creado`, 'success');
            }

            saveDB();
            closeModal();
            updateCartBadge();
            renderInventario();
            renderProductos();
        };
    }

    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    if (cancelModalBtn) cancelModalBtn.onclick = closeModal;

    const exitCompactBtn = document.getElementById('btn-exit-compact');
    if (exitCompactBtn) exitCompactBtn.onclick = closeCompactMode;

    const addCatBtn = document.getElementById('btn-add-category');
    if (addCatBtn) {
        addCatBtn.onclick = () => {
            const input = document.getElementById('new-category-input');
            const val = input ? input.value.trim() : '';
            if (!val) return;
            if (state.categories.includes(val)) {
                showToast('Este pasillo ya existe.', 'warning');
                return;
            }
            state.categories.push(val);
            input.value = '';
            saveDB();
            renderCategoriesManager();
            showToast(`Pasillo "${val}" añadido`, 'success');
        };
    }

    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) exportBtn.onclick = exportBackup;

    const importInput = document.getElementById('file-import-backup');
    if (importInput) {
        importInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (importBackup(parsed)) {
                        initTheme();
                        updateCartBadge();
                        renderInventario();
                        showToast('Copia restaurada con éxito', 'success');
                    } else showToast('Archivo JSON no válido.', 'warning');
                } catch (err) { showToast('Error al leer el archivo JSON.', 'warning'); }
                importInput.value = '';
            };
            reader.readAsText(file);
        };
    }

    window.addEventListener('open-edit-modal', (e) => openModal(e.detail.productId));
});

function setupSearch(inputId, clearBtnId, callback) {
    const input = document.getElementById(inputId);
    const clearBtn = document.getElementById(clearBtnId);
    if (!input || !clearBtn) return;

    input.oninput = () => {
        if (input.value.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
        callback();
    };

    clearBtn.onclick = () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        callback();
        input.focus();
    };
}
