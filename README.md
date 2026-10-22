# 📦 Control de Inventario Doméstico y Gestión de Recetas (PWA) - v2.1.1

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript (ES Modules)**, **HTML5** y **CSS3**.

---

## 🚀 Novedades de la Versión v2.1.1

1. **Gestor de Recetas Limpio y Estricto (`/js/recipes.js`):**
   * Eliminación absoluta de sintaxis LaTeX en favor de operadores estándar (`||`).
   * Selector inicial al pulsar `+ Receta`: **Crear Receta Manualmente** o **Buscar en TheMealDB (con IA)**.
   * Flujo online paso a paso: Vista previa de ingredientes originales de la API $\rightarrow$ Interpretación y traducción con Gemini IA $\rightarrow$ Tabla de validación intermedia editable $\rightarrow$ Guardado definitivo.
2. **Escalado Proporcional por Comensales:**
   * Soporte completo para cálculo dinámico desde **1 comensal** en adelante.
3. **Actualización Automática de PWA:**
   * Caché `despensa-pwa-v2.1.1` y banner flotante de actualización instantánea (`skipWaiting`).