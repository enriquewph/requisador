<div align="center">

# 📋 Requisador de Requisitos

### *Herramienta Moderna para la Gestión de Requisitos en Ingeniería de Sistemas*

[![GitHub Pages](https://img.shields.io/badge/Demo%20en%20Vivo-Azul?style=for-the-badge&logo=github)](https://enriquewph.com.ar/requisador/)
[![Built with](https://img.shields.io/badge/Construido%20con-HTML%20%7C%20CSS%20%7C%20JavaScript-brightgreen?style=for-the-badge)](#-tecnologías)
[![License](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)](LICENSE)

---

**🎯 Aplicación interactiva para crear y gestionar requisitos de sistema siguiendo la metodología del Systems Engineering Handbook**

*Desarrollado para UTN FRC 2025 - Proyecto Final de Carrera*

[🚀 **Demo en Vivo**](https://enriquewph.com.ar/requisador/) | [📖 **Documentación**](#-características) | [💻 **Inicio Rápido**](#-inicio-rápido)

</div>

---

## 🌟 Descripción General

**Requisador de Requisitos** es una aplicación web completa diseñada para facilitar la creación, organización y gestión de requisitos de sistemas. Construida siguiendo la metodología del Systems Engineering Handbook, proporciona una interfaz intuitiva para que los equipos de ingeniería definan requisitos de comportamiento y rendimiento precisos para sistemas complejos.

### ✨ Características Destacadas

- 🧙‍♂️ **Asistente Paso a Paso** - Proceso guiado de creación de requisitos
- 🔄 **Vista Previa en Tiempo Real** - Ve los requisitos mientras los construyes
- 📊 **Organización Inteligente** - Reordenamiento con gestión automática de IDs
- 📤 **Múltiples Formatos de Exportación** - Soporte para CSV, LaTeX y JSON
- 💾 **Almacenamiento Persistente** - Almacenamiento local con importación/exportación de proyectos
- 📱 **Diseño Responsivo** - Funciona perfectamente en todos los dispositivos
- 🎨 **Interfaz Moderna** - Diseño limpio y profesional con notificaciones toast
- 🔧 **Sistema Configurable** - Personaliza funciones, variables y componentes
- 🌳 **Vista de Árbol** - Visualización jerárquica de requisitos padre-hijo

---

## 🚀 Inicio Rápido

### 🌐 Demo en Línea
Visita la demo en vivo: [https://enriquewph.com.ar/requisador/](https://enriquewph.com.ar/requisador/)

### 💻 Instalación Local

1. **Clonar o descargar** este repositorio
2. **Abrir terminal** en el directorio raíz del proyecto
3. **Iniciar el servidor**:
   - **Windows**: Hacer doble clic en `start-server.bat` o ejecutar:
     ```cmd
     start-server.bat
     ```
   - **Linux/Mac**: Ejecutar `./start-server.sh` o:
     ```bash
     ./start-server.sh
     ```
4. **Abrir navegador** e ir a: `http://localhost:8000`

### 🗂️ Estructura del Proyecto
```
requisador/
├── src/                          # 📁 Archivos fuente (listos para despliegue)
│   ├── index.html               # Aplicación principal
│   ├── assets/                  # Recursos estáticos
│   │   └── favicon.svg          # Icono de la aplicación
│   ├── components/              # Componentes HTML reutilizables
│   │   ├── header.html          # Encabezado con navegación
│   │   ├── footer.html          # Pie de página
│   │   └── about-modal.html     # Modal "Acerca de"
│   ├── pages/                   # Contenido de pestañas
│   │   ├── config.html          # Configuración del sistema
│   │   ├── create.html          # Creación de requisitos
│   │   ├── list.html            # Lista de requisitos
│   │   ├── tree.html            # Vista de árbol
│   │   └── guidelines.html      # Lineamientos
│   ├── js/                      # Módulos JavaScript
│   │   ├── core/                # Funcionalidad principal
│   │   │   ├── app.js           # Aplicación principal
│   │   │   └── config.js        # Configuración de la app
│   │   ├── modules/             # Módulos especializados
│   │   │   ├── requirements.js  # Gestión de requisitos
│   │   │   └── export.js        # Funciones de exportación
│   │   └── utils/               # Utilidades
│   │       ├── page-loader.js   # Cargador dinámico de páginas
│   │       └── init.js          # Inicialización
│   └── css/                     # Hojas de estilo
│       └── styles.css           # Estilos principales
├── start-server.bat             # 🚀 Script servidor Windows
├── start-server.sh              # 🚀 Script servidor Linux/Mac
├── README.md                    # 📖 Este archivo
├── CHANGELOG.md                 # 📋 Historial de versiones
└── LICENSE                      # 📄 Licencia MIT
```

### ⚙️ Requisitos del Sistema
- **Navegador Web**: Navegador moderno (Chrome, Firefox, Safari, Edge)
- **Python**: 3.x (para opción de servidor local)
- **Internet**: Requerido para Tailwind CSS y Google Fonts

---

## 🎯 Características Principales

### 🧠 **Gestión Inteligente de Requisitos**
- **Asistente de Creación Interactivo** con proceso guiado de 4 pasos
- **Vista previa en tiempo real** de requisitos mientras escribes
- **Reordenamiento de requisitos** (mover arriba/abajo/inicio/final)
- **Renumeración automática de IDs** cuando se mueven requisitos
- **Validación inteligente** para asegurar completitud
- **Requisitos padre-hijo** con gestión automática de sub-requisitos

### � **Configuración del Sistema**
- **Funciones personalizables** para diferentes módulos del sistema
- **Variables configurables** para monitoreo y control
- **Soporte multi-componente** (HMI, ECI, o Ambos)
- **Gestión de modos** para diferentes estados del sistema
- **Importación/exportación de configuración** para colaboración en equipo

### 📊 **Exportación e Importación**
- **Exportación CSV** - Para análisis en hojas de cálculo
- **Exportación LaTeX** - Para documentación académica
- **Exportación JSON de Proyecto** - Respaldo completo del proyecto
- **Importación drag-and-drop** - Restauración fácil de proyectos
- **Generación de prompts IA** - Para justificaciones automáticas

### 🎨 **Experiencia de Usuario**
- **Navegación por pestañas** para flujo de trabajo organizado
- **Notificaciones toast** para retroalimentación instantánea
- **Diseño responsivo** optimizado para todos los tamaños de pantalla
- **Panel de lineamientos** con mejores prácticas
- **Carga dinámica de contenido** para mejor rendimiento
- **Modal "Acerca de"** con información del proyecto

---

## 🛠️ Tecnologías

<div align="center">

| Tecnología | Propósito | Badge |
|------------|---------|-------|
| **HTML5** | Estructura y Semántica | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) |
| **CSS3** | Estilos y Diseño Responsivo | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) |
| **JavaScript ES6+** | Funcionalidad Interactiva | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) |
| **Tailwind CSS** | Framework CSS Utility-First | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) |
| **Fetch API** | Comunicaciones HTTP | ![Fetch](https://img.shields.io/badge/Fetch%20API-4285F4?style=flat&logo=google-chrome&logoColor=white) |
| **Local Storage** | Persistencia de Datos | ![Storage](https://img.shields.io/badge/Local%20Storage-FF6B6B?style=flat&logo=html5&logoColor=white) |

</div>

### 🏗️ **Arquitectura Modular**

- **Separación de Responsabilidades**: Core, Modules, Utils
- **Carga Dinámica**: PageLoader para contenido bajo demanda
- **Event-Driven**: Sistema de eventos para comunicación entre módulos
- **Configuración Centralizada**: AppConfig para paths y configuraciones
- **Cache-Busting**: Versionado automático para desarrollo

---

## 📖 Guía de Uso

### 1️⃣ **Configurar tu Sistema**
- Navega a la pestaña "Configuración del Sistema"
- Añade las funciones, variables y componentes de tu sistema
- Define los modos de operación para cada componente
- Exporta/importa configuraciones para compartir con el equipo

### 2️⃣ **Crear Requisitos**
- Usa la pestaña "Crear Requisito" para creación guiada
- Sigue el asistente de 4 pasos:
  - **Paso 1**: Selecciona función y variable
  - **Paso 2**: Elige componente y modo
  - **Paso 3**: Define comportamiento y condiciones
  - **Paso 4**: Especifica rendimiento y justificación
- Usa el generador de prompts IA para justificaciones automáticas

### 3️⃣ **Gestionar tus Requisitos**
- Ve todos los requisitos en la pestaña "Lista de Requisitos"
- Reordena requisitos usando los botones de flecha
- Crea sub-requisitos seleccionando un requisito padre
- Exporta a CSV o LaTeX para documentación

### 4️⃣ **Visualizar Jerarquías**
- Usa la pestaña "Vista de Árbol" para ver estructura jerárquica
- Expande/colapsa nodos para navegación fácil
- Identifica rápidamente requisitos padre e hijos

### 5️⃣ **Seguir Mejores Prácticas**
- Consulta la pestaña "Lineamientos para Requisitos"
- Sigue la metodología del Systems Engineering Handbook
- Asegura completitud y consistencia

---

## 🎯 Metodología de Requisitos

Esta herramienta sigue el enfoque del **Systems Engineering Handbook** para requisitos de comportamiento y rendimiento:

### ✅ **Mejores Prácticas Implementadas**

- **Nombres de Variables Específicos** - Usa nombres exactos para variables monitoreadas/controladas
- **Especificación Clara de Modos** - Define modos y condiciones del sistema con precisión
- **Cobertura Completa** - Asigna valores a todas las variables controladas en todos los estados
- **Verificaciones de Consistencia** - Previene requisitos conflictivos
- **Métricas de Rendimiento** - Incluye especificaciones de latencia y tolerancia
- **Trazabilidad** - Organiza requisitos por función para seguimiento fácil

### 📝 **Estructura de Requisitos**

```
R[ID]: [Función] controla [Variable] en [Componente]
SI [Modo] Y [Condición] ENTONCES [Comportamiento]
Latencia: [Valor] | Tolerancia: [Valor] | Justificación: [Razonamiento]
```

### 🔄 **Gestión de Sub-requisitos**

```
R1: Requisito Principal
├── R1-0: Sub-requisito A
├── R1-1: Sub-requisito B
└── R1-2: Sub-requisito C
```

---

## 🚀 Despliegue

### 🌐 **Para Producción**

Para despliegue en producción, simplemente copia el contenido del directorio `src/` a tu servidor web:

```bash
# Ejemplo: Desplegar en servidor web
cp -r src/* /var/www/html/
```

La aplicación funcionará con cualquier servidor web estándar (Apache, Nginx, etc.)

### 📦 **GitHub Pages**

Para desplegar en GitHub Pages:

1. Sube el contenido de `src/` a la rama `gh-pages`
2. Habilita GitHub Pages en la configuración del repositorio
3. Tu aplicación estará disponible en `https://usuario.github.io/repositorio/`

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor consulta nuestras [Guías de Contribución](CONTRIBUTING.md) para detalles.

### 🛠️ **Configuración de Desarrollo**

1. Haz fork del repositorio
2. Crea una rama de característica: `git checkout -b feature/caracteristica-increible`
3. Realiza tus cambios
4. Prueba exhaustivamente
5. Commit con mensajes descriptivos: `git commit -m 'Añadir característica increíble'`
6. Push a tu rama: `git push origin feature/caracteristica-increible`
7. Abre un Pull Request

### � **Reportar Bugs**

Si encuentras un bug, por favor abre un issue con:
- Descripción detallada del problema
- Pasos para reproducir
- Capturas de pantalla si es aplicable
- Información del navegador y sistema operativo

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

<div align="center">

**Desarrollado con ❤️ por [Enrique Walter Philippeaux](https://github.com/enriquewph)**

*UTN FRC 2025 - Proyecto Final de Carrera*

*Para los Gladiadores Electrónicos y la comunidad de ingeniería*

[![GitHub](https://img.shields.io/badge/GitHub-enriquewph-black?style=for-the-badge&logo=github)](https://github.com/enriquewph)

</div>

---

## 🙏 Agradecimientos

- **Systems Engineering Handbook** - Por la metodología y mejores prácticas
- **UTN FRC** - Universidad Tecnológica Nacional, Facultad Regional Córdoba
- **Gladiadores Electrónicos** - El increíble equipo para el que se construyó esta herramienta
- **Tailwind CSS** - Por el hermoso framework CSS utility-first
- **GitHub Copilot** - Por la asistencia en el desarrollo y resolución de problemas
- **Comunidad Open Source** - Por las inspiraciones y herramientas utilizadas

---

## 📋 Changelog

### v1.0.0 (2025-07-05)
- ✨ Lanzamiento inicial
- 🎯 Sistema completo de gestión de requisitos
- 📊 Exportación múltiple (CSV, LaTeX, JSON)
- 🔧 Sistema de configuración personalizable
- 🌳 Vista de árbol para requisitos jerárquicos
- 📱 Diseño completamente responsivo
- 🔄 Carga dinámica de contenido
- 🎨 Interfaz moderna con Tailwind CSS

---

<div align="center">

### ⭐ **¡Dale una estrella a este repositorio si te resulta útil!**

*Hecho con 💙 para la comunidad de ingeniería*

**[🔝 Volver al inicio](#-requisador-de-requisitos)**

</div>
