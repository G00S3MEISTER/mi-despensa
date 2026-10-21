# 📦 Control de Inventario Doméstico (PWA) - v1.9.1 (Release Final)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Diseñada para ofrecer un control absoluto del stock del hogar, lista de la compra automatizada, soporte offline mediante Service Workers y máxima usabilidad móvil.

---

## 🚀 Novedades de la Versión v1.9.2

* **Píldora Horizontal Integrada 3 en 1 (`styles.css` / `app.js`):**
  * Rediseño táctil del control de cantidades en el Modo Compacto (Supermercado).
  * Sustitución del stepper vertical por una **píldora horizontal unificada** de formato `[ - ] [ cantidad + unidad ] [ + ]`, diseñada específicamente para facilitar su uso con una sola mano en dispositivos móviles.
  * Mayor espacio horizontal protegido para nombres largos de productos y respuesta háptica inmediata en cada toque.
* **Service Worker y Caché:**
  * Actualización de la caché PWA a `despensa-pwa-v1.9.2`.

## 🚀 Novedades y Mejoras de la Versión v1.9.1

1. **Stepper Ultra-Compacto en Modo Supermercado (`styles.css` / `app.js`):**
   * Eliminación de los inputs numéricos anchos dentro del overlay de lista compacta.
   * Sustitución por un bloque ultracompacto a la derecha formado por una **píldora visual de cantidad** (`1 ud`) y un **mini-stepper vertical** con botones `+` / `-` en columna estrecha.
   * Maximiza el espacio horizontal para que los nombres largos de los productos se visualicen sin saltos de línea.
2. **Chips de Filtro de Inventario Compactos (`styles.css`):**
   * Optimización absoluta para garantizar que los 5 botones de umbral (`⚪ Todos`, `🔴 0%`, `🟠 <25%`, `🟡 <50%`, `🟢 >50%`) quepan en una **única línea horizontal** en pantallas móviles estrechas.
3. **Modo Oscuro Forzado en Modo Compacto (`app.js`):**
   * Al abrir el overlay del Modo Supermercado, se activa automáticamente la clase `dark-mode` para proporcionar un alto contraste bajo la iluminación de los pasillos, restaurando la preferencia original al cerrar.
4. **Orden Alfabético Estricto y Acordeones en Catálogo:**
   * Sincronización de la ordenación alfabética estricta (A-Z) en pasillos y productos de todas las pestañas, junto con acordeones táctiles desplegables (`▼ / ▲`) en las tarjetas de pasillo de la pestaña *Productos*.
5. **Sustitución Total de Alertas Nativas y Háptica:**
   * Diálogos nativos `alert`/`confirm` reemplazados por Toasts y modales personalizados internos de la PWA.
   * Retroalimentación háptica corta (`navigator.vibrate`) integrada en el supermercado y marcado de cesta.
6. **Respaldo Inteligente y Service Worker v1.9.1:**
   * Exportación JSON con formato automático: `despensa_backup_v1.9_YYYY-MM-DD.json`.
   * Caché del Service Worker actualizada a `despensa-pwa-v1.9.1`.

---

## 📱 Guía Rápida de Despliegue e Instalación

### Despliegue en la Web (GitHub Pages / Netlify)
1. Sube todos los archivos del proyecto a un repositorio público o servidor estático con soporte **HTTPS**.

### Instalación en la Pantalla de Inicio del Móvil
* **Android (Chrome / Edge):** Menú ➔ "Instalar aplicación".
* **iOS (Safari):** Botón Compartir ➔ "Añadir a pantalla de inicio".

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0 - v1.7.2** | Inventario base, semáforo visual de stock, persistencia en cesta, PWA offline y feedback háptico. |
| **v1.8.0 - v1.8.5** | Pasillos personalizables, Modo Oscuro/Claro manual, orden alfabético en selectores, limpieza de buscadores, eliminación del botón "Nuevo" en inventario y umbrales acumulativos. |
| **v1.9.0 - v1.9.1** | **Release Final:** Stepper vertical ultracompacto en supermercado, chips de filtro en una línea, modo oscuro forzado en cesta, acordeones en catálogo y modales personalizados. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
