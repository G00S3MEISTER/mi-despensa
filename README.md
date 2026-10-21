# 📦 Control de Inventario Doméstico (PWA) - v1.9.2 (Release Final)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Diseñada para ofrecer un control absoluto del stock del hogar, lista de la compra automatizada, soporte offline mediante Service Workers y máxima usabilidad móvil.

---

## 🚀 Novedades y Mejoras de la Versión v1.9.2

1. **Píldora Horizontal Integrada 3 en 1 (`styles.css` / `app.js`):**
   * Rediseño táctil del control de cantidades en el Modo Compacto (Supermercado).
   * Sustitución del control anterior por una **píldora horizontal unificada** con formato `[ - ] [ cantidad + unidad ] [ + ]`, diseñada específicamente para facilitar su uso con una sola mano en dispositivos móviles.
   * Mayor espacio horizontal protegido para nombres largos de productos y respuesta háptica inmediata en cada toque (`navigator.vibrate(20)`).
2. **Órdenes Alfabéticos y UI Optimizada:**
   * Orden alfabético estricto (A-Z) en todas las pestañas, acordeones desplegables en el catálogo de productos y fichas de pasillos.
3. **Respaldo Inteligente y Service Worker v1.9.2:**
   * Exportación JSON con formato automático: `despensa_backup_v1.9_YYYY-MM-DD.json`.
   * Caché del Service Worker actualizada a `despensa-pwa-v1.9.2`.

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
| **v1.9.0 - v1.9.1** | Chips de filtro en una línea, modo oscuro forzado en cesta, acordeones en catálogo y modales personalizados. |
| **v1.9.2** | **Release Final:** Píldora horizontal integrada 3 en 1 (`[ - ] [ qty ] [ + ]`) optimizada para uso a una sola mano en supermercados y sincronización de caché v1.9.2. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
