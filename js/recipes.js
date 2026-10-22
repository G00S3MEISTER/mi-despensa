/* ==========================================================================
   MÓDULO DE RECETAS, RECETAFORGE IA & ESCALADO PROPORCIONAL (v2.1)
   ========================================================================== */
import { getState, saveDB } from './db.js';
import { showToast, showCustomConfirm } from './app.js';

let tempIngredientsList = [];

export function renderRecetas() {
    const container = document.getElementById('contenedor-recetas');
    if (!container) return;

    const state = getState();
    const recipes = state.recipes || [];

    if (recipes.length === 0) {
        container.innerHTML = `
            <div class="card empty-msg" style="text-align: center; padding: 1.5rem;">
                <h3>🍳 Catálogo de Recetas Vacío</h3>
                <p class="product-meta" style="margin-top: 0.5rem;">Pulsa el botón <strong>+ Receta</strong> en la barra superior para buscar en TheMealDB o crear una con IA.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="item-list">
            ${recipes.map(r => `
                <div class="card item-row">
                    <div class="item-info">
                        <strong>${r.nombre}</strong>
                        <div class="product-meta">${r.categoria \vert{}\vert{} 'General'} \vert{} 👥 ${r.raciones || 4} comensales base</div>
                    </div>
                    <div class="actions">
                        <button class="btn btn-secondary small" data-action="view-recipe" data-id="${r.id}">Ver / Escalar</button>
                        <button class="btn btn-danger small" data-action="delete-recipe" data-id="${r.id}">Borrar</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    bindRecipeListEvents();
}

function bindRecipeListEvents() {
    const container = document.getElementById('contenedor-recetas');
    if (!container) return;

    container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            if (action === 'view-recipe') openViewRecipeModal(id);
            if (action === 'delete-recipe') deleteRecipe(id);
        };
    });
}

export function openRecetaForgeModal() {
    const modal = document.getElementById('receta-forge-modal');
    if (!modal) return;
    
    // Resetear formulario
    document.getElementById('edit-recipe-id').value = '';
    document.getElementById('recipe-input-name').value = '';
    document.getElementById('recipe-input-category').value = '';
    document.getElementById('recipe-input-diners').value = 4;
    document.getElementById('recipe-input-steps').value = '';
    document.getElementById('mealdb-results-grid').innerHTML = '';
    tempIngredientsList = [];
    renderIngredientsEditor();

    switchForgeTab('mealdb');
    modal.classList.remove('hidden');
}

export function closeRecetaForgeModal() {
    const modal = document.getElementById('receta-forge-modal');
    if (modal) modal.classList.add('hidden');
}

function switchForgeTab(tab) {
    const secMealDB = document.getElementById('section-mealdb');
    const secEditor = document.getElementById('section-recipe-editor');
    const btnMealDB = document.getElementById('btn-tab-mealdb');
    const btnManual = document.getElementById('btn-tab-manual');

    if (tab === 'mealdb') {
        secMealDB.classList.remove('hidden');
        secEditor.classList.add('hidden');
        btnMealDB.classList.add('active');
        btnManual.classList.remove('active');
    } else {
        secMealDB.classList.add('hidden');
        secEditor.classList.remove('hidden');
        btnMealDB.classList.remove('active');
        btnManual.classList.add('active');
    }
}

export function initRecetaForgeEvents() {
    const btnSearchMealDB = document.getElementById('btn-search-mealdb');
    const inputSearchMealDB = document.getElementById('search-mealdb-input');

    if (btnSearchMealDB) btnSearchMealDB.onclick = searchTheMealDB;
    if (inputSearchMealDB) {
        inputSearchMealDB.onkeyup = (e) => { if (e.key === 'Enter') searchTheMealDB(); };
    }

    const btnTabMealDB = document.getElementById('btn-tab-mealdb');
    const btnTabManual = document.getElementById('btn-tab-manual');
    if (btnTabMealDB) btnTabMealDB.onclick = () => switchForgeTab('mealdb');
    if (btnTabManual) btnTabManual.onclick = () => switchForgeTab('manual');

    const btnClose = document.getElementById('btn-close-forge-modal');
    const btnCancel = document.getElementById('btn-cancel-recipe');
    if (btnClose) btnClose.onclick = closeRecetaForgeModal;
    if (btnCancel) btnCancel.onclick = closeRecetaForgeModal;

    const btnAddIngRow = document.getElementById('btn-add-ingredient-row');
    if (btnAddIngRow) {
        btnAddIngRow.onclick = () => {
            tempIngredientsList.push({ nombre: '', cantidad_num: 100, unidad: 'g' });
            renderIngredientsEditor();
        };
    }

    const btnSaveFinal = document.getElementById('btn-save-recipe-final');
    if (btnSaveFinal) btnSaveFinal.onclick = saveFinalRecipe;

    const btnCloseView = document.getElementById('btn-close-view-modal');
    if (btnCloseView) btnCloseView.onclick = () => document.getElementById('view-recipe-modal').classList.add('hidden');
}

async function searchTheMealDB() {
    const query = document.getElementById('search-mealdb-input').value.trim();
    const grid = document.getElementById('mealdb-results-grid');
    if (!query) return showToast('Introduce un nombre de plato en inglés', 'warning');

    grid.innerHTML = '<div class="empty-msg">Cargando recetas de TheMealDB...</div>';

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.meals) {
            grid.innerHTML = '<div class="empty-msg">No se encontraron resultados en TheMealDB.</div>';
            return;
        }

        grid.innerHTML = data.meals.map(m => `
            <div class="mealdb-card" data-meal-id="${m.idMeal}">
                <img src="${m.strMealThumb}" alt="${m.strMeal}">
                <div class="mealdb-card-title">${m.strMeal}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.mealdb-card').forEach(card => {
            card.onclick = () => loadMealDBRecipe(card.getAttribute('data-meal-id'), data.meals);
        });
    } catch (e) {
        grid.innerHTML = '<div class="empty-msg">Error al conectar con TheMealDB.</div>';
    }
}

async function loadMealDBRecipe(mealId, mealsList) {
    const meal = mealsList.find(m => m.idMeal === mealId);
    if (!meal) return;

    showToast('Procesando receta con Gemini IA...', 'info');

    const rawIngredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
            rawIngredients.push(`${measure ? measure.trim() : '1'} ${ing.trim()}`);
        }
    }

    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
        try {
            const systemPrompt = `Devuelve ÚNICAMENTE un objeto JSON válido con la traducción al español y normalización de cantidades en sistema métrico europeo:
            {
              "nombre": "Nombre traducido al español",
              "categoria": "Categoría traducida",
              "raciones": 4,
              "ingredientes": [
                {"nombre": "Nombre ingrediente", "cantidad_num": 200, "unidad": "g"}
              ],
              "pasos": ["Paso 1", "Paso 2"]
            }`;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nTraducir esta receta:\nNombre: ${meal.strMeal}\nIngredientes:\n${rawIngredients.join('\n')}\nInstrucciones:\n${meal.strInstructions}` }] }]
                })
            });

            const data = await res.json();
            const rawText = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);

            fillEditorForm(parsed.nombre, parsed.categoria, parsed.raciones || 4, parsed.ingredientes || [], (parsed.pasos || []).join('\n'));
            switchForgeTab('manual');
            showToast('Receta traducida e interpretada por IA', 'success');
            return;
        } catch (err) {
            console.warn('Fallback sin IA por error o clave expirada:', err);
        }
    }

    // Fallback directo si no hay API Key
    const fallbackIngs = rawIngredients.map(i => ({ nombre: i, cantidad_num: 1, unidad: 'ud' }));
    fillEditorForm(meal.strMeal, meal.strCategory || 'General', 4, fallbackIngs, meal.strInstructions);
    switchForgeTab('manual');
}

function fillEditorForm(name, category, diners, ingredients, steps) {
    document.getElementById('recipe-input-name').value = name;
    document.getElementById('recipe-input-category').value = category;
    document.getElementById('recipe-input-diners').value = diners;
    document.getElementById('recipe-input-steps').value = steps;
    tempIngredientsList = ingredients;
    renderIngredientsEditor();
}

function renderIngredientsEditor() {
    const container = document.getElementById('ingredients-editor-list');
    if (!container) return;

    if (tempIngredientsList.length === 0) {
        container.innerHTML = '<div class="empty-msg">No hay ingredientes agregados.</div>';
        return;
    }

    container.innerHTML = tempIngredientsList.map((ing, idx) => `
        <div class="ingredient-edit-row">
            <input type="text" placeholder="Ingrediente" value="${ing.nombre || ''}" onchange="updateTempIng(${idx}, 'nombre', this.value)" style="flex: 2;">
            <input type="number" placeholder="Cant." value="${ing.cantidad_num || 1}" onchange="updateTempIng(${idx}, 'cantidad_num', parseFloat(this.value))" style="flex: 1;">
            <input type="text" placeholder="Unidad" value="${ing.unidad || 'ud'}" onchange="updateTempIng(${idx}, 'unidad', this.value)" style="flex: 1;">
            <button type="button" class="btn btn-danger small" onclick="removeTempIng(${idx})">✕</button>
        </div>
    `).join('');
}

window.updateTempIng = (idx, field, val) => {
    if (tempIngredientsList[idx]) tempIngredientsList[idx][field] = val;
};

window.removeTempIng = (idx) => {
    tempIngredientsList.splice(idx, 1);
    renderIngredientsEditor();
};

function saveFinalRecipe() {
    const name = document.getElementById('recipe-input-name').value.trim();
    const category = document.getElementById('recipe-input-category').value.trim() || 'General';
    const diners = parseInt(document.getElementById('recipe-input-diners').value) || 4;
    const stepsRaw = document.getElementById('recipe-input-steps').value.trim();

    if (!name) return showToast('El nombre de la receta es obligatorio', 'warning');

    const state = getState();
    const editId = document.getElementById('edit-recipe-id').value;

    const recipeObj = {
        id: editId || 'receta_' + Date.now(),
        nombre: name,
        categoria: category,
        raciones: diners,
        ingredientes: tempIngredientsList.filter(i => i.nombre.trim() !== ''),
        pasos: stepsRaw ? stepsRaw.split('\n').filter(s => s.trim() !== '') : []
    };

    if (editId) {
        const idx = state.recipes.findIndex(r => r.id === editId);
        if (idx !== -1) state.recipes[idx] = recipeObj;
    } else {
        state.recipes.push(recipeObj);
    }

    saveDB();
    closeRecetaForgeModal();
    renderRecetas();
    showToast(`Receta "${name}" guardada con éxito`, 'success');
}

function openViewRecipeModal(id) {
    const state = getState();
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;

    const modal = document.getElementById('view-recipe-modal');
    const titleEl = document.getElementById('view-recipe-title');
    const bodyEl = document.getElementById('view-recipe-body');

    titleEl.textContent = recipe.nombre;

    const renderScaledBody = (currentDiners) => {
        const factor = currentDiners / (recipe.raciones || 4);

        bodyEl.innerHTML = `
            <div class="diners-selector-box">
                <span>Comensales:</span>
                <button class="btn btn-secondary small" id="btn-dec-diners">-</button>
                <span id="scaled-diners-val" style="font-size: 1.1rem; min-width: 24px; text-align: center;">${currentDiners}</span>
                <button class="btn btn-secondary small" id="btn-inc-diners">+</button>
                <span class="product-meta" style="margin-left: auto;">(Base: ${recipe.raciones || 4})</span>
            </div>

            <h4>Ingredientes (${currentDiners} ${currentDiners === 1 ? 'persona' : 'personas'}):</h4>
            <ul style="margin-top: 6px; margin-bottom: 12px; padding-left: 20px;">
                ${(recipe.ingredientes || []).map(ing => {
                    const scaledVal = Math.round((ing.cantidad_num * factor) * 100) / 100;
                    return `<li style="margin-bottom: 4px;"><strong>${scaledVal} ${ing.unidad \vert{}\vert{} ''}</strong> -${ing.nombre}</li>`;
                }).join('')}
            </ul>

            <h4>Pasos de Elaboración:</h4>
            <ol style="margin-top: 6px; padding-left: 20px;">
                ${(recipe.pasos || []).map(p => `<li style="margin-bottom: 6px;">${p}</li>`).join('')}
            </ol>
        `;

        document.getElementById('btn-dec-diners').onclick = () => {
            if (currentDiners > 1) renderScaledBody(currentDiners - 1);
        };
        document.getElementById('btn-inc-diners').onclick = () => {
            renderScaledBody(currentDiners + 1);
        };
    };

    renderScaledBody(recipe.raciones || 4);
    modal.classList.remove('hidden');
}

function deleteRecipe(id) {
    const state = getState();
    const recipe = state.recipes.find(r => r.id === id);
    showCustomConfirm('Eliminar Receta', `¿Estás seguro de eliminar "${recipe ? recipe.nombre : 'esta receta'}"?`, () => {
        state.recipes = state.recipes.filter(r => r.id !== id);
        saveDB();
        renderRecetas();
        showToast('Receta eliminada', 'warning');
    });
}