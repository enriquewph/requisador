# Requisador - Sistema de Gestión de Requisitos

Una aplicación web profesional para gestionar requisitos en proyectos de ingeniería de sistemas, construida con **Angular 17** y diseñada para ejecutarse completamente en **Docker**. Este sistema sigue la metodología del Manual de Ingeniería de Sistemas para crear, organizar y gestionar requisitos comportamentales y de rendimiento para sistemas complejos.

## 🎯 Descripción General

**Requisador** elimina errores manuales en la escritura de requisitos proporcionando un enfoque estructurado y guiado por asistente para la gestión de requisitos. Gestiona cuatro entidades principales (Funciones, Variables, Componentes, Modos) y genera requisitos estandarizados en formato español:

```
"El [Componente] deberá [Comportamiento] [Variable] cuando el sistema esté en modo [Modo]"
```

## 🏗️ Funcionalidades Principales

### **1. Gestión de Configuración**
- **Funciones**: Capacidades del sistema (ej: "Navegación", "Comunicación", "Control")
- **Variables**: Parámetros controlados (ej: "Velocidad", "Posición", "Temperatura") 
- **Componentes**: Partes del sistema (ej: "HMI", "ECI")
- **Modos**: Condiciones operativas (ej: "Normal", "Emergencia", "Mantenimiento")

### **2. Asistente de Creación de Requisitos**
Proceso guiado paso a paso:
1. Seleccionar Función + Variable
2. Elegir Requisito Padre (opcional, para estructura jerárquica)  
3. Seleccionar Componente + Modo
4. Escribir Descripción del Comportamiento
5. Vista Previa y Confirmación

### **3. Múltiples Modos de Vista**
- **Vista Lista**: Visualización tabular con columnas ordenables y edición en línea
- **Vista Árbol**: Visualización jerárquica interactiva con arrastrar y soltar

### **4. Gestión de Datos**
- **Formatos de exportación**: JSON, CSV
- **Base de datos SQLite**: Esquema normalizado con restricciones de clave foránea
- **Requisitos jerárquicos**: Relaciones padre-hijo con generación automática de ID

## 🚀 Stack Tecnológico

- **Angular 17**: Framework web moderno con componentes independientes
- **TailwindCSS**: Framework CSS utility-first
- **SQLite**: Base de datos local con esquema normalizado
- **Docker**: Contenerización completa (¡no requiere Node.js local!)
- **TypeScript**: JavaScript con tipado seguro

## 🐳 Comenzar (Desarrollo Solo con Docker)

### Prerequisitos
- **Docker Desktop** (incluye Docker Compose)
- **VS Code** (recomendado para desarrollo)

### Inicio Rápido

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repo-url>
   cd requisador
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   docker-compose up --build
   ```
   
   **O** usar tarea de VS Code: **🚀 Iniciar Servidor Dev**

3. **Navegar a:** `http://localhost:4200`

¡La aplicación se recargará automáticamente cuando cambies archivos fuente!

## 🔧 Flujo de Desarrollo

### **Tareas de VS Code** (Presiona `Ctrl+Shift+P` → "Tasks: Run Task"):
- **🚀 Iniciar Servidor Dev** - Comando principal de desarrollo (tarea de construcción por defecto)
- **🛑 Detener Servidor Dev** - Detener el contenedor
- **🏗️ Construir Sitio Estático** - Construir para producción (directorio `/dist/`)
- **🧪 Ejecutar Pruebas** - Ejecutar pruebas unitarias vía Karma

### **Comandos Manuales:**
```bash
# Iniciar desarrollo con hot reload
docker-compose up --build

# Detener servicios
docker-compose down

# Construir sitio estático (requiere contenedor ejecutándose)
docker-compose exec app npm run build

# Ejecutar pruebas (requiere contenedor ejecutándose)
docker-compose exec app npm test
```

## 📋 Prioridades de Desarrollo

### **Fase 1: Fundación Central** 
- ✅ Entorno de desarrollo Docker
- ✅ Configuración Angular 17 con TailwindCSS
- 🔄 Configuración de base de datos y gestión de entidades (SQLite)
- 🔄 Operaciones CRUD básicas para todas las entidades
- 🔄 Flujo simple de creación de requisitos

### **Fase 2: Funcionalidades Avanzadas**
- 🔄 Asistente de creación de requisitos
- 🔄 Soporte para requisitos jerárquicos
- 🔄 Múltiples modos de vista (Lista, Árbol)
- 🔄 Funcionalidad de importación/exportación

### **Fase 3: Pulido y Rendimiento**
- 🔄 Mejoras avanzadas de UI/UX
- 🔄 Optimización de rendimiento
- 🔄 Manejo integral de errores
- 🔄 Sistema de documentación y ayuda

## 🗄️ Esquema de Base de Datos (SQLite)

```sql
functions (id, name, description, timestamps)
variables (id, name, description, timestamps)
components (id, name, description, timestamps)  
modes (id, name, description, timestamps)
mode_components (mode_id, component_id) -- Tabla de unión muchos-a-muchos
requirements (id, function_id, variable_id, component_id, mode_id, parent_id, behavior, level, order_index, timestamps)
metadata (key, value, timestamps) -- Seguimiento de versiones
```

## 🎯 Métricas de Éxito

### **Objetivos Funcionales**
- ✅ Eliminar errores manuales en la escritura de requisitos
- ✅ Asegurar estructura consistente de requisitos
- ✅ Habilitar generación rápida de requisitos para sistemas grandes
- ✅ Proporcionar múltiples vistas para diferentes necesidades de stakeholders
- ✅ Soportar refinamiento iterativo y reorganización

### **Objetivos Técnicos**  
- ✅ Interfaz de usuario rápida y responsiva
- ✅ Persistencia e integridad de datos confiable
- ✅ Arquitectura escalable para proyectos complejos
- ✅ Capacidades de exportación de grado profesional

## 🚨 Notas Importantes

- **No Requiere Node.js**: Todo se ejecuta en contenedores Docker
- **Primera Construcción**: El `docker-compose up --build` inicial toma 5-10 minutos
- **Hot Reload**: Los cambios de archivos en `src/` activan reconstrucciones automáticas
- **Multiplataforma**: Funciona en Windows, Mac, Linux

## 📁 Estructura del Proyecto

```
📁 requisador/
├── 🐳 Dockerfile & docker-compose.yml
├── 📦 package.json (Angular 17 + dependencias)
├── 📁 .vscode/ (tareas de VS Code)
├── 📁 src/
│   ├── 📁 app/ (componentes Angular)
│   ├── 🎨 styles.css (TailwindCSS)
│   └── 🏠 index.html
├── 📋 FUNCTIONAL_SPECIFICATION.md (Especificaciones completas)
└── 📖 README.md (Este archivo)
```

## 🤝 Contribuir

Este es un proyecto de ingeniería de sistemas para gestión de requisitos. Las contribuciones deben seguir los patrones arquitectónicos establecidos en la especificación funcional.

1. Hacer Fork del Proyecto
2. Crear tu Rama de Funcionalidad (`git checkout -b feature/AsistenteRequisitos`)
3. Hacer Commit de tus Cambios (`git commit -m 'Agregar Asistente de Creación de Requisitos'`)
4. Push a la Rama (`git push origin feature/AsistenteRequisitos`)
5. Abrir un Pull Request

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📚 Documentación

- 📋 **[FUNCTIONAL_SPECIFICATION.md](./FUNCTIONAL_SPECIFICATION.md)** - Especificaciones completas de la aplicación
- 🚀 **[README_SETUP.md](./README_SETUP.md)** - Guía detallada de configuración Docker

---

**🎯 Objetivo: Un sistema moderno, escalable y de grado profesional para gestión de requisitos usando Angular con arquitectura y experiencia de usuario superiores.**
