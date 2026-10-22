# 📦 Control de Inventario Doméstico y Gestión de Recetas (PWA) - v2.1.2

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript (ES Modules)**, **HTML5** y **CSS3**.

---

## 🚀 Novedades de la Versión v2.1.2 (Optimización UI/UX RecetaForge)

1. **Gestor de Recetas Optimizado (`/js/recipes.js`):**
   * **Selector en Paralelo:** Botones de *"Crear Manual"* y *"Buscar en TheMealDB"* colocados lado a lado en fila.
   * **Buscador Minimalista Inicial:** El modo TheMealDB arranca limpio mostrando únicamente la barra de búsqueda y vaciando por completo los resultados al retornar o limpiar.
   * **Scroll Fluido Natural:** Eliminación de contenedores rígidos con `overflow-y` y alturas pequeñas para evitar "scroll dentro de scroll" en ingredientes crudos e instrucciones.
   * **Feedback IA Persistente:** Indicador visual dinámico *"🤖 Analizando receta con IA (gemini-3.8-flash)..."* durante la llamada asíncrona.
2. **Escalado Proporcional por Comensales:**
   * Soporte completo para cálculo dinámico desde **1 comensal** en adelante.
3. **Actualización Automática de PWA:**
   * Caché `despensa-pwa-v2.1.2` y banner flotante de actualización instantánea (`skipWaiting`).
