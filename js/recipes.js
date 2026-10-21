/* ==========================================================================
   MÓDULO DE RECETAS (Estructura base para v2.0 Alfa)
   ========================================================================== */
import { getState } from './db.js';

export function renderRecetas() {
    const container = document.getElementById('contenedor-recetas');
    if (!container) return;

    const state = getState();
    const recipes = state.recipes || [];

    if (recipes.length === 0) {
        container.innerHTML = `
            <div class="card empty-msg" style="text-align: center; padding: 1.5rem;">
                <h3>🍳 Catálogo de Recetas Vacío</h3>
                <p class="product-meta" style="margin-top: 0.5rem;">Usa la herramienta <strong>RecetaForge IA</strong> en Ajustes para importar recetas desde TheMealDB o crearlas con Gemini IA.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="section-header">
            <h2>🍳 Mis Recetas (${recipes.length})</h2>
        </div>
        <div class="item-list">
            ${recipes.map(r => `
                <div class="card item-row">
                    <div class="item-info">
                        <strong>${r.nombre}</strong>
                        <div class="product-meta">${r.categoria \vert{}\vert{} 'General'} \vert{} ⏱️ ${r.tiempo_preparacion_min || 20} min</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
