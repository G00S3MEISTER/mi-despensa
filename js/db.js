/* ==========================================================================
   MÓDULO DE BASE DE DATOS LOCAL Y GESTIÓN DE LOCALSTORAGE (v2.0 Alfa)
   ========================================================================== */
const STORAGE_KEY = 'despensa_pwa_data_v2';

const DEFAULT_CATEGORIES = [
    'Lácteos', 'Frutería y Verdura', 'Carnicería', 'Pescadería', 'Despensa / Granel', 'Bebidas', 'Limpieza', 'Otros'
];

let appState = {
    version: 'v2.0.0-alfa',
    products: [],
    categories: [...DEFAULT_CATEGORIES],
    recipes: [],
    planner: {},
    darkMode: false,
    inventoryViewMode: 'categories',
    activeFilter: 'all',
    collapsedCategories: {}
};

export function initDB() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error("Error al cargar localStorage, usando estado por defecto:", e);
        }
    } else {
        // Migración transparente desde v1.9 si existe
        const oldProducts = JSON.parse(localStorage.getItem('inventory_products'));
        const oldCategories = JSON.parse(localStorage.getItem('inventory_categories'));
        const oldDarkMode = JSON.parse(localStorage.getItem('inventory_darkmode'));
        
        if (oldProducts) appState.products = oldProducts;
        if (oldCategories) appState.categories = oldCategories;
        if (typeof oldDarkMode === 'boolean') appState.darkMode = oldDarkMode;

        saveDB();
    }
    return appState;
}

export function getState() {
    return appState;
}

export function saveDB() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

export function exportBackup() {
    const todayStr = new Date().toISOString().split('T')[0];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `despensa_backup_v2.0_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

export function importBackup(jsonData) {
    if (jsonData && Array.isArray(jsonData.products)) {
        appState.products = jsonData.products;
        if (Array.isArray(jsonData.categories)) appState.categories = jsonData.categories;
        if (Array.isArray(jsonData.recipes)) appState.recipes = jsonData.recipes;
        if (jsonData.planner) appState.planner = jsonData.planner;
        if (typeof jsonData.darkMode === 'boolean') appState.darkMode = jsonData.darkMode;
        if (jsonData.inventoryViewMode) appState.inventoryViewMode = jsonData.inventoryViewMode;
        
        saveDB();
        return true;
    }
    return false;
}