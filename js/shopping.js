/* ==========================================================================
   MÓDULO DE LISTA DE LA COMPRA Y MODO SUPERMERCADO (v2.0 Estable)
   ========================================================================== */
import { getState, saveDB } from './db.js';
import { getStepForUnit } from './inventory.js';
import { showToast, initTheme, updateCartBadge } from './app.js';

let cartAdjustments = {};
let selectedCartIds = new Set();

export function renderCompra() {
    const state = getState();
    const container = document.getElementById('contenedor-compra');
    if (!container) return;
    container.innerHTML = '';

    const needed = state.products.filter(p => p.currentStock < p.targetStock);

    if (needed.length === 0) {
        container.innerHTML = '<div class="empty-msg card">¡Todo abastecido! No necesitas comprar nada.</div>';
        return;
    }

    const grouped = needed.reduce((acc, p) => {
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
            const defaultQtyToBuy = Math.round((p.targetStock - p.currentStock) * 100) / 100;
            
            if (!(p.id in cartAdjustments)) {
                cartAdjustments[p.id] = defaultQtyToBuy;
            }

            const currentBuyVal = cartAdjustments[p.id];
            const isChecked = selectedCartIds.has(p.id) ? 'checked' : '';

            return `
                <div class="item-row inner-row shopping-item">
                    <label class="checkbox-label">
                        <input type="checkbox" class="purchase-check" data-id="${p.id}" ${isChecked}>
                        <span class="item-title">${p.name}</span>
                    </label>
                    <div class="cart-qty-adjuster">
                        <button class="btn-qty small" data-action="dec-cart" data-id="${p.id}">-</button>
                        <input type="number" class="cart-qty-input item-qty" data-id="${p.id}" value="${currentBuyVal}" min="0" step="${step}">
                        <span class="unit-text">${unit}</span>
                        <button class="btn-qty small" data-action="inc-cart" data-id="${p.id}">+</button>
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

    bindCompraEvents();
}

function bindCompraEvents() {
    const container = document.getElementById('contenedor-compra');
    if (!container) return;

    container.querySelectorAll('.purchase-check').forEach(chk => {
        chk.onchange = () => {
            const id = chk.getAttribute('data-id');
            if (chk.checked) selectedCartIds.add(id);
            else selectedCartIds.delete(id);
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
        };
    });

    container.querySelectorAll('.cart-qty-input').forEach(input => {
        input.onchange = (e) => {
            const id = e.target.getAttribute('data-id');
            const val = parseFloat(e.target.value);
            cartAdjustments[id] = !isNaN(val) && val >= 0 ? Math.round(val * 100) / 100 : 0;
            renderCompra();
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
            const currentVal = cartAdjustments[id] !== undefined ? cartAdjustments[id] : (prod.targetStock - prod.currentStock);
            
            if (action === 'inc-cart') {
                cartAdjustments[id] = Math.round((currentVal + step) * 100) / 100;
            } else if (action === 'dec-cart') {
                cartAdjustments[id] = Math.round(Math.max(0, currentVal - step) * 100) / 100;
            }
            renderCompra();
        };
    });
}

export function initCartGlobalButtons() {
    const selectAllBtn = document.getElementById('btn-select-all');
    if (selectAllBtn) {
        selectAllBtn.onclick = () => {
            const state = getState();
            state.products.filter(p => p.currentStock < p.targetStock).forEach(p => selectedCartIds.add(p.id));
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
            renderCompra();
        };
    }

    const deselectAllBtn = document.getElementById('btn-deselect-all');
    if (deselectAllBtn) {
        deselectAllBtn.onclick = () => {
            selectedCartIds.clear();
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
            renderCompra();
        };
    }

    const finishPurchaseBtn = document.getElementById('btn-finish-purchase');
    if (finishPurchaseBtn) {
        finishPurchaseBtn.onclick = () => {
            if (selectedCartIds.size === 0) {
                showToast('Marca al menos un elemento comprado.', 'warning');
                return;
            }

            const state = getState();
            selectedCartIds.forEach(id => {
                const prod = state.products.find(p => p.id === id);
                if (prod) {
                    const addedQty = cartAdjustments[id] !== undefined ? cartAdjustments[id] : (prod.targetStock - prod.currentStock);
                    prod.currentStock = Math.round((prod.currentStock + addedQty) * 100) / 100;
                    delete cartAdjustments[id];
                }
            });

            selectedCartIds.clear();
            saveDB();
            updateCartBadge();
            renderCompra();
            showToast('Stock repuesto con éxito', 'success');
        };
    }
}

export function openCompactMode() {
    const compactOverlay = document.getElementById('compact-mode-overlay');
    if (compactOverlay) compactOverlay.classList.remove('hidden');
    document.body.classList.add('dark-mode');
    renderCompactList();
}

export function closeCompactMode() {
    const compactOverlay = document.getElementById('compact-mode-overlay');
    if (compactOverlay) compactOverlay.classList.add('hidden');
    initTheme();
    renderCompra();
}

export function renderCompactList() {
    const overlayBody = document.getElementById('compact-overlay-body');
    if (!overlayBody) return;
    overlayBody.innerHTML = '';

    const state = getState();
    const needed = state.products.filter(p => p.currentStock < p.targetStock);

    if (needed.length === 0) {
        overlayBody.innerHTML = '<div class="empty-msg card">¡Todo abastecido! No necesitas comprar nada.</div>';
        return;
    }

    const grouped = needed.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    Object.keys(grouped).sort().forEach(cat => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
        const sectionEl = document.createElement('div');
        sectionEl.className = 'compact-section-table';

        let rowsHtml = grouped[cat].map(p => {
            const unit = p.unit || 'ud';
            const step = getStepForUnit(unit);
            const qty = cartAdjustments[p.id] !== undefined ? cartAdjustments[p.id] : Math.round((p.targetStock - p.currentStock) * 100) / 100;
            const isChecked = selectedCartIds.has(p.id) ? 'checked' : '';
            const checkedClass = isChecked ? 'compact-row-checked' : '';

            return `
                <div class="compact-table-row ${checkedClass}" data-action="toggle-check" data-id="${p.id}">
                    <div class="compact-col-check">
                        <input type="checkbox" class="compact-overlay-check" data-id="${p.id}" ${isChecked}>
                    </div>
                    <div class="compact-col-name">${p.name}</div>
                    <div class="compact-col-qty-pill" onclick="event.stopPropagation()">
                        <button class="btn-pill-step" data-action="dec-compact" data-id="${p.id}" title="Reducir">−</button>
                        <span class="pill-value">${qty} ${unit}</span>
                        <button class="btn-pill-step" data-action="inc-compact" data-id="${p.id}" title="Incrementar">+</button>
                    </div>
                </div>
            `;
        }).join('');

        sectionEl.innerHTML = `
            <div class="compact-section-title">📂 Pasillo: ${cat}</div>
            <div class="compact-table-container">${rowsHtml}</div>
        `;
        overlayBody.appendChild(sectionEl);
    });

    bindCompactEvents();
}

function bindCompactEvents() {
    const overlayBody = document.getElementById('compact-overlay-body');
    if (!overlayBody) return;

    overlayBody.querySelectorAll('.compact-table-row').forEach(row => {
        row.onclick = () => {
            const id = row.getAttribute('data-id');
            if (selectedCartIds.has(id)) selectedCartIds.delete(id);
            else selectedCartIds.add(id);
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
            renderCompactList();
        };
    });

    overlayBody.querySelectorAll('.compact-overlay-check').forEach(chk => {
        chk.onclick = (e) => {
            e.stopPropagation();
            const id = chk.getAttribute('data-id');
            if (chk.checked) selectedCartIds.add(id);
            else selectedCartIds.delete(id);
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
            renderCompactList();
        };
    });

    overlayBody.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            const state = getState();
            const prod = state.products.find(p => p.id === id);
            if (!prod) return;

            const step = getStepForUnit(prod.unit);
            const currentVal = cartAdjustments[id] !== undefined ? cartAdjustments[id] : (prod.targetStock - prod.currentStock);

            if (action === 'inc-compact') {
                cartAdjustments[id] = Math.round((currentVal + step) * 100) / 100;
            } else if (action === 'dec-compact') {
                cartAdjustments[id] = Math.round(Math.max(0, currentVal - step) * 100) / 100;
            }
            if ('vibrate' in navigator) { try { navigator.vibrate(20); } catch(e){} }
            renderCompactList();
        };
    });
}

export function copyShoppingListToClipboard() {
    const state = getState();
    const needed = state.products.filter(p => p.currentStock < p.targetStock);
    if (needed.length === 0) {
        showToast('La lista de la compra está vacía', 'warning');
        return;
    }

    const grouped = needed.reduce((acc, p) => {
        acc[p.category] = acc[p.category] || [];
        acc[p.category].push(p);
        return acc;
    }, {});

    let textToCopy = "🛒 LISTA DE LA COMPRA - MI DESPENSA v2.0\n\n";
    Object.keys(grouped).sort().forEach(cat => {
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
    }).catch(() => {
        showToast('No se pudo copiar al portapapeles.', 'warning');
    });
}
