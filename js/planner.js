/* ==========================================================================
   MÓDULO DE PLANIFICADOR SEMANAL (Estructura base para v2.0 Alfa)
   ========================================================================== */
import { getState, saveDB } from './db.js';

export function renderPlanner() {
    const container = document.getElementById('contenedor-planificador');
    if (!container) return;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    container.innerHTML = `
        <div class="section-header">
            <h2>📅 Plan Semanal de Menús</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${dias.map(dia => `
                <div class="card" style="padding: 10px 14px;">
                    <strong style="color: var(--primary-color);">${dia}</strong>
                    <div class="product-meta" style="margin-top: 4px;">Almuerzo: Sin planificar</div>
                    <div class="product-meta">Cena: Sin planificar</div>
                </div>
            `).join('')}
        </div>
    `;
}