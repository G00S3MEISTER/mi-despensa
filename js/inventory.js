/* ==========================================================================
   MÓDULO DE CONTROL DE INVENTARIO Y CATÁLOGO (v2.0 Estable - Corrección de Filtros y Acordeones)
   ========================================================================== */
import { getState, saveDB } from './db.js';
import { showToast, showCustomConfirm, updateCartBadge } from './app.js';

export const normalizeText = (text) => 
    text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

export const getStepForUnit = (unit) => {
    const normalizedUnit = (unit || 'ud').toLowerCase();
    if (normalizedUnit === 'g' || normalizedUnit === 'ml') return 50;
    return 1;
};

export const getStockSemaphore = (current, target) => {
    if (current === 0) return { color: '🔴', label: 'Sin Stock' };
    const ratio = current / target;
    if (ratio <= 0.25) return { color: '🟠', label: 'Crítico' };
    if (ratio <= 0.50) return { color: '🟡', label: 'En Reserva' };
    return { color: '🟢', label: 'Saludable' };
};

export function renderInventario() {
    const state = getState();
    const container = document.getElementById('lista-inventario-container');
    const searchInput = document.getElementById('search-inventario');
    const viewLabel = document.getElementById('view-mode-label');
    if (!container) return;

    if (viewLabel) {
        viewLabel.textContent = state.inventoryViewMode === 'categories' ? 'Categorías' : 'Alfabética';
    }

    const query = normalizeText(searchInput ? searchInput.value : '');
    container.innerHTML = '';

    let filtered = state.products.filter(p => 
        normalizeText(p.name).includes(query) || normalizeText(p.category).includes(query)
    );

    // Corrección rigurosa de filtros: productos con stock 0 (agotados) deben aparecer en umbrales bajos (<25%, <50%)
    if (state.activeFilter === 'red') {
        filtered = filtered.filter(p => p.currentStock === 0);
    } else if (state.activeFilter === 'orange') {
        filtered = filtered.filter(p => p.currentStock === 0 || (p.currentStock / p.targetStock) <= 0.25);
    } else if (state.activeFilter === 'yellow') {
        filtered = filtered.filter(p => p.currentStock === 0 || (p.currentStock / p.targetStock) <= 0.50);
    } else if (state.activeFilter === 'green') {
        filtered = filtered.filter(p => p.currentStock > 0 && (p.currentStock / p.targetStock) > 0.50);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-msg card">No hay productos que coincidan con el filtro seleccionado.</div>';
        return;
    }

    if (state.inventoryViewMode === 'alphabetical') {
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

            const isCollapsed = !!state.collapsedCategories[cat];
            const arrowSymbol = isCollapsed ? '▼' : '▲';
            const collapsedClass = isCollapsed ? 'collapsed' : '';

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
                            <button class="btn-qty" data-action="dec-stock" data-id="${p.id}" ${isMinDisabled}>-</button>
                            <span class="qty-badge">${p.currentStock} ${unit}</span>
                            <button class="btn-qty" data-action="inc-stock" data-id="${p.id}">+</button>
                        </div>
                    </div>
                `;
            }).join('');

            groupEl.innerHTML = `
                <div class="category-header-accordion" data-accordion-cat="${cat}">
                    <span>📂 ${cat} (${grouped[cat].length})</span>
                    <span class="accordion-arrow">${arrowSymbol}</span>
                </div>
                <div class="category-items ${collapsedClass}">${itemsHtml}</div>
            `;
            container.appendChild(groupEl);
        });
    }

    bindInventoryEvents();
}

function createProductListItem(p) {
    const unit = p.unit || 'ud';
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
            <button class="btn-qty" data-action="dec-stock" data-id="${p.id}" ${isMinDisabled}>-</button>
            <span class="qty-badge">${p.currentStock} ${unit}</span>
            <button class="btn-qty" data-action="inc-stock" data-id="${p.id}">+</button>
        </div>
    `;
    return li;
}

function bindInventoryEvents() {
    const container = document.getElementById('lista-inventario-container');
    if (!container) return;

    // Acordeones persistentes en inventario por categoría
    container.querySelectorAll('.category-header-accordion').forEach(header => {
        header.onclick = () => {
            const cat = header.getAttribute('data-accordion-cat');
            const state = getState();
            state.collapsedCategories[cat] = !state.collapsedCategories[cat];
            saveDB();
            renderInventario();
        };
    });

    container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            const state = getState();
            const prod = state.products.find(p => p.id === id);
            if (!prod) return;

            const step = getStepForUnit(prod.unit);
            if (action === 'inc-stock') {
                prod.currentStock = Math.round((prod.currentStock + step) * 100) / 100;
            } else if (action === 'dec-stock' && prod.currentStock > 0) {
                prod.currentStock = Math.round(Math.max(0, prod.currentStock - step) * 100) / 100;
            }
            saveDB();
            updateCartBadge();
            renderInventario();
        };
    });
}

export function renderProductos() {
    const state = getState();
    const container = document.getElementById('contenedor-productos');
    const searchInput = document.getElementById('search-productos');
    if (!container) return;
    const query = normalizeText(searchInput ? searchInput.value : '');
    container.innerHTML = '';

    const filtered = state.products.filter(p => 
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

    Object.keys(grouped).sort().forEach(cat => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));

        const isCollapsed = !!state.collapsedCategories[cat];
        const arrowSymbol = isCollapsed ? '▼' : '▲';
        const collapsedClass = isCollapsed ? 'collapsed' : '';

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
                        <button class="btn btn-secondary small" data-action="edit-prod" data-id="${p.id}">Editar</button>
                        <button class="btn btn-danger small" data-action="del-prod" data-id="${p.id}">Borrar</button>
                    </div>
                </div>
            `;
        }).join('');

        groupEl.innerHTML = `
            <div class="category-header-accordion" data-accordion="${cat}">
                <span>📂 ${cat} (${grouped[cat].length})</span>
                <span class="accordion-arrow">${arrowSymbol}</span>
            </div>
            <div class="category-items ${collapsedClass}">${itemsHtml}</div>
        `;
        container.appendChild(groupEl);
    });

    bindProductosEvents();
}

function bindProductosEvents() {
    const container = document.getElementById('contenedor-productos');
    if (!container) return;

    container.querySelectorAll('.category-header-accordion').forEach(header => {
        header.onclick = () => {
            const cat = header.getAttribute('data-accordion');
            const state = getState();
            state.collapsedCategories[cat] = !state.collapsedCategories[cat];
            saveDB();
            renderProductos();
        };
    });

    container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            if (action === 'edit-prod') {
                window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: { productId: id } }));
            } else if (action === 'del-prod') {
                const state = getState();
                const prod = state.products.find(p => p.id === id);
                showCustomConfirm(
                    'Eliminar Producto',
                    `¿Estás seguro de eliminar "${prod ? prod.name : 'este producto'}"?`,
                    () => {
                        state.products = state.products.filter(p => p.id !== id);
                        saveDB();
                        updateCartBadge();
                        renderProductos();
                        showToast('Producto eliminado', 'warning');
                    }
                );
            }
        };
    });
}
