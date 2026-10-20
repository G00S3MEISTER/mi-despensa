# 📦 Control de Inventario Doméstico (PWA)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Permite un control preciso sobre el stock del hogar, lista de la compra automatizada y gestión de datos con persistencia local.

---

## 🚀 Novedades de la Versión v1.6.0

* **Transformación PWA Nativa:** Conversión completa a Progressive Web App instalable tanto en dispositivos Android como iOS.
* **Soporte Offline (Service Worker):** Incorporación del archivo `sw.js` con estrategia de caché *Cache First, Network Fallback*, permitiendo consultar el inventario y usar la lista de la compra en el supermercado sin cobertura o conexión a Internet.
* **Manifiesto Web (`manifest.json`):** Configuración de metadatos de instalación, pantalla completa (`standalone`), orientación portrait y recursos gráficos de iconos (`192x192` y `512x512`).
* **Optimización Táctil Móvil:** Inclusión de `touch-action: manipulation;`, eliminación de resaltaos grises al pulsar (`-webkit-tap-highlight-color: transparent;`) y garantía de un área táctil mínima de `44px x 44px` en botones y controles.

---

## 📱 Guía Rápida de Despliegue e Instalación

### Despliegue en la Web (GitHub Pages / Netlify)
1. Sube todos los archivos del proyecto (`index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js` y la carpeta `assets/` con los iconos) a un repositorio público de GitHub o arrástralos a un sitio de despliegue estático como Netlify.
2. Asegúrate de que el servidor sirva los archivos mediante **HTTPS** (requisito obligatorio para que los Service Workers se registren correctamente).

### Instalación en la Pantalla de Inicio del Móvil
* **En Android (Chrome / Edge):** Abre la URL de la aplicación, pulsa el menú de opciones (tres puntos superiores) y selecciona **"Instalar aplicación"** o **"Añadir a la pantalla principal"**.
* **En iOS (Safari):** Abre la URL de la aplicación, pulsa el botón **Compartir** (icono de salida) y selecciona **"Añadir a pantalla de inicio"**.

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0** | Versión inicial con gestión básica de inventario y almacenamiento en `localStorage`. |
| **v1.1** | Cálculo automático de necesidades de compra y botón para reposición rápida. |
| **v1.1.1**| Corrección de bugs menores de renderizado y mejoras en el estilo visual. |
| **v1.2** | Sistema de navegación inferior de 4 pestañas, agrupación por pasillos/categorías, buscador en tiempo real e ítems extra. |
| **v1.3.0**| Pasa a formularios modales, captura simultánea de stock actual/objetivo y categorías libres con sugerencias. |
| **v1.3.1**| Correcciones UI/UX: Regla estricta de reposición por compra, indicador badge en cesta, selector de unidades, layout adaptado sin desbordamientos y reordenación de navegación. |
| **v1.3.2**| Ajustes de interacción: Botones de modificación rápida `+` / `-` en inventario, formato visual en la cesta y rediseño del botón de importación de respaldos. |
| **v1.4.0**| Evolución UX y Súper: Ajuste manual de compra, Modo Súper con Screen Wake Lock API, filtros por estado y panel de métricas con indicador de cobertura. |
| **v1.4.1**| Parche de Usabilidad y Búsqueda: Normalización NFD para tildes/mayúsculas, rediseño CSS para el Modo Súper y gestión silenciosa de Wake Lock. |
| **v1.5.0**| UX Móvil y Gestión Masiva: Adaptabilidad 100% responsive, supresión de spin buttons nativos, saltos dinámicos por unidad (`50` para `g`/`ml`), chips coloreados, marcar/desmarcar masivo en Cesta y backups ISO fechados. |
| **v1.5.1**| Corrección de Bugs y Ajustes de UX: Modo Súper restringido a la Cesta, reordenación de la navegación inferior, negritas en métricas, corrección del decremento a 0 en Cesta y agrupación por categorías en Productos. |
| **v1.5.2**| Hito 1 - Cierre y Reubicación Súper: Reubicación estructural del botón de Modo Súper exclusivamente dentro de la pestaña Cesta/Compra. |
| **v1.6.0**| **Evolución PWA Nativa:** Implementación de Service Worker para soporte offline completo, `manifest.json` para instalación en pantalla de inicio, optimización táctil móvil y guía de despliegue. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
* **Screen Wake Lock API:** Mantenimiento activo de la pantalla en modo supermercado.