# 📦 Control de Inventario Doméstico y Gestión de Recetas (PWA) - v2.0 Alfa

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript (ES Modules)**, **HTML5** y **CSS3**. Diseñada para ofrecer un control absoluto del stock del hogar, pasillos de supermercado personalizables, factoría de recetas asistida por IA y soporte offline nativo.

---

## 🚀 Novedades y Correcciones de la Versión v2.0 Alfa

1. **Estabilidad en Filtros de Stock y Acordeones (`/js/inventory.js`):**
   * Corrección de la condición numérica en los filtros de umbral bajo (`<25%`, `<50%` y agotados `0%`), asegurando que los productos con stock exactamente igual a `0` aparezcan correctamente en las vistas de reposición.
   * Implementación de acordeones desplegables con persistencia de estado por categoría para colapsar u ocultar ítems.
2. **Sincronización de Badges y Gestión de IA (`/js/app.js`):**
   * Actualización inmediata del contador flotante (`badge`) en la cesta al reponer o modificar stock de productos.
   * Integración de la gestión segura de la API Key de Gemini almacenada en el `localStorage` mediante la clave `'gemini_api_key'`.
3. **Arquitectura Modular ES6:**
   * Separación limpia en módulos independientes (`db.js`, `inventory.js`, `shopping.js`, `recipes.js`, `planner.js`, `app.js`) cargados con `<script type="module">`.

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0 - v1.8.5** | Inventario base, semáforo visual de stock, pasillos personalizables, modo claro/oscuro y ordenación. |
| **v1.9.0 - v1.9.2** | Píldora horizontal integrada 3 en 1 para uso a una sola mano en supermercado, acordeones y respaldo JSON. |
| **v2.0 Alfa** | **Refactorización Modular y Estabilidad:** Migración a ES6 Modules, corrección de filtros de stock en 0, gestión de API Key de Gemini y RecetaForge IA. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6 Modules):** Sin frameworks externos, usando `import`/`export`.
* **Service Workers & Web App Manifest:** Soporte para instalación y funcionamiento 100% offline.
* **Google Gemini API & TheMealDB API:** Generación y estandarización de recetas en `receta_forge.html`.
