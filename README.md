# 📦 Control de Inventario Doméstico y Gestión de Recetas (PWA) - v2.1 Release Final

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript (ES Modules)**, **HTML5** y **CSS3**. Diseñada para ofrecer un control absoluto del stock del hogar, pasillos de supermercado personalizables, factoría e importador de recetas asistido por IA y soporte offline nativo.

---

## 🚀 Novedades de la Versión v2.1 (Release Final)

1. **Ecosistema Integrado de Recetas (`/js/recipes.js`):**
   * Botón directo **`+ Receta`** en el recetario para abrir `RecetaForge`.
   * Integración con **TheMealDB API** (búsqueda visual con imágenes ejecutable mediante Enter o Clic).
   * Traducción, interpretación y estandarización métrica europea mediante **Google Gemini IA (`gemini-2.5-flash`)**.
   * Creación manual de recetas con editor de ingredientes dinámico y eliminación individual.
2. **Escalado Dinámico por Comensales:**
   * Cálculo en tiempo real de proporciones numéricas de ingredientes por porciones (con soporte específico para **1 comensal**, 2, 3, 4...).
3. **Actualización Automática de PWA (Anti-Bloqueos de Caché):**
   * Detección activa en Service Worker y presentación de banner flotante *"🚀 Nueva versión v2.1 lista"* para forzar `skipWaiting` y recarga limpia sin borrar la caché del navegador.
4. **Homogeneización UI/UX:**
   * Cabecera azul `.topbar` con dimensiones y rellenos unificados en todas las pestañas.
   * Enlace directo a Google AI Studio (`https://aistudio.google.com/app/apikey`) desde la pestaña Ajustes.

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0 - v1.9.2** | Inventario base, semáforos, píldora horizontal 3 en 1, pasillos personalizables y respaldo JSON. |
| **v2.0 Alfa** | Refactorización a ES Modules, corrección de filtros de stock en 0 y estructura de recetas. |
| **v2.1** | **Release Final:** Factoría RecetaForge nativa con Gemini IA, escalador de comensales (1p+), creación manual, auto-update SW y cabeceras unificadas. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6 Modules):** Arquitectura limpia sin dependencias externas.
* **Service Workers & Web App Manifest:** Soporte para instalación y funcionamiento 100% offline.
* **Google Gemini API (`gemini-2.5-flash`) & TheMealDB API:** Traducción e interpretación inteligente de recetas.