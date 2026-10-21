# 📦 Control de Inventario Doméstico y Gestión de Recetas (PWA) - v2.0 Alfa

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript (ES Modules)**, **HTML5** y **CSS3**. Diseñada para ofrecer un control absoluto del stock del hogar, pasillos de supermercado personalizables, factoría de recetas asistida por IA y soporte offline nativo.

---

## 🚀 Novedades de la Versión v2.0 Alfa (Refactorización Modular)

1. **Arquitectura Modular ES6 (`/js/`):**
   * Transición del monolito a un sistema basado en módulos JS independientes (`db.js`, `inventory.js`, `shopping.js`, `recipes.js`, `planner.js`, `app.js`).
   * Despliegue de scripts mediante `<script type="module">` para un mantenimiento escalable.
2. **Preparación del Ecosistema v2.0:**
   * Integración de la herramienta `/tools/receta_forge.html` (traductor e intérprete de recetas con IA Gemini y API TheMealDB).
   * Estructura base preparada para la ingesta de JSONs de recetas y planificación de menús semanales.
3. **Consolidación de UX de la v1.9.2:**
   * Mantenimiento de la **Píldora Horizontal 3 en 1** táctil con feedback de vibración (`navigator.vibrate`).
   * Exportación de backups con nomenclatura actualizada `despensa_backup_v2.0_YYYY-MM-DD.json`.
   * Service Worker actualizado a `despensa-pwa-v2.0.0-alfa`.

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0 - v1.8.5** | Inventario base, semáforo visual de stock, pasillos personalizables, modo claro/oscuro y ordenación. |
| **v1.9.0 - v1.9.2** | Píldora horizontal integrada 3 en 1 para uso a una sola mano en supermercado, acordeones y respaldo JSON. |
| **v2.0 Alfa** | **Refactorización Modular:** Separación en módulos ES6, integración de `RecetaForge` y cimientos para el Planificador y Recetario. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6 Modules):** Sin frameworks externos, usando `import`/`export`.
* **Service Workers & Web App Manifest:** Soporte para instalación y funcionamiento 100% offline.
* **Google Gemini API (`gemini-2.5-flash`) & TheMealDB API:** Generación y estandarización de recetas en `receta_forge.html`.