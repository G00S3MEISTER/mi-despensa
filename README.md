# 📦 Control de Inventario Doméstico (PWA)

Aplicación Web Progresiva (PWA) ligera, rápida y moderna construida en **Vanilla JavaScript**, **HTML5** y **CSS3**. Permite un control preciso sobre el stock del hogar, lista de la compra automatizada y gestión de datos con persistencia local.

---

## 🚀 Novedades de la Versión v1.8.0

* **Gestión Personalizable de Pasillos / Categorías:** Nueva sección en Ajustes para añadir y eliminar pasillos del supermercado de manera dinámica, actualizando automáticamente los selectores en formularios.
* **Nuevo Modo Lista Compacta (Pantalla Completa):** Interfaz tipo cuaderno/cuadrícula con líneas divisorias inspirada en tablas de secciones. Oculta la barra superior y navegación inferior para aprovechar todo el espacio útil en pasillo de compra.
* **Modo Oscuro / Claro Manual:** Interruptor dedicado en la pestaña de Ajustes con persistencia en `localStorage` y adaptación cromática integral.
* **Copiar Lista al Portapapeles:** Botón rápido en la cesta para exportar la lista completa estructurada por pasillos como texto plano.
* **Indicador de Versión:** Etiqueta limpia visible al final de la pestaña de Ajustes (*Versión de la app: v1.8.0*).
* **Service Worker v1.8.0:** Caché renovada para asegurar funcionamiento offline óptimo.

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
| **v1.0 - v1.6.0** | Inventario base, cálculos automáticos, PWA nativa offline y optimización táctil. |
| **v1.7.0 - v1.7.2** | Semáforo visual de stock, persistencia en cesta, feedback háptico y filtros cromáticos. |
| **v1.8.0** | **Gestión de Pasillos, Modo Compacto, Tema Oscuro/Claro y Copia Rápida:** Incorporación de pasillos personalizables, vista tabular a pantalla completa, selector de tema, exportación de texto y etiqueta de versión. |

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Estructura semántica, diseño responsive, Flexbox, CSS Grid y CSS Variables.
* **Vanilla JavaScript (ES6+):** Sin frameworks ni dependencias externas.
* **Service Workers & Web App Manifest:** Capacidades offline y nativas de PWA.
* **Clipboard & Vibration API:** Interacción nativa para copias y respuesta háptica.