# 📦 Control de Inventario Doméstico (PWA)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Permite un control preciso sobre el stock del hogar, lista de la compra automatizada y gestión de datos con persistencia local.

---

## 🚀 Novedades de la Versión v1.7.1

* **Semáforo Visual de Stock Actualizado:** Umbrales precisos de disponibilidad por ratio (`currentStock / targetStock`):
  * 🔴 **Rojo:** `currentStock === 0` (Sin Stock).
  * 🟠 **Naranja:** `0 < ratio <= 0.25` (Crítico, hasta el 25%).
  * 🟡 **Amarillo:** `0.25 < ratio <= 0.50` (En Reserva, del 25% al 50%).
  * 🟢 **Verde:** `ratio > 0.50` (Saludable, estrictamente mayor al 50%).
* **Filtros Cromáticos Sincronizados:** Botones interactivos superiores en la pestaña de Inventario (`[Todos]`, `[🔴 Sin Stock]`, `[🟠 Crítico]`, `[🟡 En Reserva]`, `[🟢 Saludable]`) con iluminación dinámica y filtrado instantáneo.
* **Modo Súper AMOLED:** Entorno de alto contraste con fondo negro absoluto (`#000000`), fuentes extra grandes en blanco (`1.5rem`) optimizado para pasillo de supermercado y uso a una sola mano.
* **Gestión de Cachá Actualizada (`sw.js`):** Service Worker migrado a la versión `despensa-pwa-v1.7.1` para garantizar la recarga inmediata de activos en dispositivos móviles.

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
| **v1.0 - v1.6.0** | Bases de inventario, cálculos automáticos, PWA nativa offline, Service Worker y optimización táctil. |
| **v1.7.0** | Semáforo visual de stock, persistencia de selección en cesta, rediseño Modo Súper y corrección ortográfica de reposición. |
| **v1.7.1** | **Semáforo Estricto y Filtros Cromáticos:** Actualización de umbrales porcentuales de alerta, chips de filtro cromáticos integrados, Modo Súper AMOLED y caché v1.7.1. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
* **Screen Wake Lock API:** Mantenimiento activo de la pantalla en modo supermercado.