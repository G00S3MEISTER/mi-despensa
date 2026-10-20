# 📦 Control de Inventario Doméstico (PWA)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Permite un control preciso sobre el stock del hogar, lista de la compra automatizada y gestión de datos con persistencia local.

---

## 🚀 Novedades de la Versión v1.8.5

* **Eliminación Definitiva del Botón "Nuevo" en Inventario:** Se ha limpiado por completo la esquina superior de la pestaña de inventario, unificando la gestión de creación de productos en la barra superior contextual y conservando únicamente el selector de vista.
* **Lógica de Filtros por Umbral Acumulativo:** Actualización del comportamiento de los chips de stock en inventario para funcionar como umbrales acumulativos hacia abajo:
  * **`🔴 0%`**: Muestra exclusivamente los productos agotados.
  * **`🟠 <25%`**: Muestra productos críticos e incluye los agotados.
  * **`🟡 <50%`**: Muestra productos en reserva, críticos y agotados.
  * **`🟢 >50%`**: Muestra productos en estado saludable.
  * **`⚪ Todos`**: Restablece y muestra todo el inventario.
* **Service Worker v1.8.5:** Caché actualizada para garantizar la sincronización inmediata de la interfaz y las nuevas funciones de filtrado.

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
| **v1.0 - v1.7.2** | Inventario base, semáforo visual de stock, persistencia en cesta, PWA offline y feedback háptico. |
| **v1.8.0 - v1.8.4** | Pasillos personalizables, Modo Lista Compacta, Modo Oscuro/Claro manual, orden alfabético en pasillos y limpieza rápida en buscadores. |
| **v1.8.5** | **Optimización UI/UX y Filtros Acumulativos:** Eliminación definitiva del botón "Nuevo" en inventario y nuevo filtrado por umbral acumulativo de stock. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.