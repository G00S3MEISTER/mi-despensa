# 📦 Control de Inventario Doméstico (PWA)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Permite un control preciso sobre el stock del hogar, lista de la compra automatizada y gestión de datos con persistencia local.

---

## 🚀 Novedades de la Versión v1.7.2 (Release Estable - Fin Hito 1)

* **Estabilidad y Rendimiento Offline Definitivos:** Service Worker optimizado bajo la caché `despensa-pwa-v1.7.2-stable` para garantizar disponibilidad total en entornos sin cobertura (supermercados).
* **Feedback Háptico Nativo:** Vibración discreta de `20ms` mediante la API de vibración al marcar o desmarcar productos en la lista de la compra.
* **Semáforo Visual y Filtros Cromáticos:** Umbrales estrictos de disponibilidad (`🔴 Sin Stock`, `🟠 Crítico <=25%`, `🟡 En Reserva <=50%`, `🟢 Saludable >50%`) perfectamente sincronizados con los chips interactivos de filtrado.
* **Persistencia Robusta en Cesta:** Retención total de selecciones de checkboxes y ajustes de packs al alternar entre las pestañas de navegación inferior.
* **Modo Súper AMOLED:** Interfaz de alto contraste en negro puro (`#000000`) con tipografía extra grande optimizada para lectura rápida en pasillos.

---

## 📱 Guía Rápida de Despliegue e Instalación

### Despliegue en la Web (GitHub Pages / Netlify)
1. Sube todos los archivos del proyecto a un repositorio público o plataforma estática compatible con **HTTPS**.

### Instalación en la Pantalla de Inicio del Móvil
* **Android (Chrome / Edge):** Menú ➔ "Instalar aplicación".
* **iOS (Safari):** Botón Compartir ➔ "Añadir a pantalla de inicio".

---

## 📋 Historial de Versiones

| Versión | Descripción y Cambios Principales |
| :--- | :--- |
| **v1.0 - v1.6.0** | Bases de inventario, cálculos automáticos, PWA nativa offline, Service Worker inicial y optimización táctil. |
| **v1.7.0 - v1.7.1** | Semáforo visual de stock, persistencia de selección en cesta, rediseño Modo Súper, corrección ortográfica y filtros cromáticos. |
| **v1.7.2** | **Release Estable (Fin Hito 1):** Consolidación general, feedback háptico táctil en Android, service worker estable v1.7.2 y pulido de UX móvil. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
* **Screen Wake Lock & Vibration API:** Mantenimiento activo de pantalla y respuesta háptica nativa.