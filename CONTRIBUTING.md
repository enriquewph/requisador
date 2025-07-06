# 🤝 Guía de Contribución para Requisador de Requisitos

¡Gracias por tu interés en contribuir al **Requisador de Requisitos**! Esta guía te ayudará a participar en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [🚀 Comenzando](#-comenzando)
- [🛠️ Configuración del Entorno](#️-configuración-del-entorno)
- [📝 Proceso de Contribución](#-proceso-de-contribución)
- [🎯 Tipos de Contribuciones](#-tipos-de-contribuciones)
- [📋 Reportar Problemas](#-reportar-problemas)
- [✅ Estándares de Código](#-estándares-de-código)
- [🧪 Pruebas](#-pruebas)
- [📖 Documentación](#-documentación)
- [🏆 Reconocimiento](#-reconocimiento)

---

## 🚀 Comenzando

### Prerequisitos

- **Node.js** 18+ y npm 9+
- **Git** para control de versiones
- **Python** 3+ (para servidor de desarrollo local)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### Fork y Clone

1. **Haz fork** del repositorio en GitHub
2. **Clona tu fork** localmente:
   ```bash
   git clone https://github.com/tu-usuario/requisador.git
   cd requisador
   ```
3. **Agrega el repositorio original** como remote:
   ```bash
   git remote add upstream https://github.com/enriquewph/requisador.git
   ```

---

## 🛠️ Configuración del Entorno

### Instalación de Dependencias

**Prerrequisitos:** [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y ejecutándose

```bash
# Configuración inicial completa
dev.bat setup    # Windows
./dev.sh setup   # Unix/Linux/macOS
```

### Ejecutar el Proyecto Localmente

```bash
# Iniciar servidor de desarrollo
dev.bat start    # Windows
./dev.sh start   # Unix/Linux/macOS
```

El sitio estará disponible en `http://localhost:8000`

### Verificar la Configuración

```bash
# Ejecutar linter
dev.bat lint

# Verificar formato
dev.bat format-check

# Validar HTML
dev.bat validate

# Formatear código
dev.bat format
```

### VS Code Tasks (F1 Shortcuts)

El proyecto incluye tareas preconfiguradas para VS Code. Presiona **F1** y busca:

- `Dev: Setup` - Configuración inicial
- `Dev: Start Server` - Iniciar servidor
- `Dev: Build CSS` - Compilar TailwindCSS
- `Dev: Watch CSS` - TailwindCSS en modo observación
- `Dev: Lint Code` - Análisis de código con ESLint
- `Dev: Format Code` - Formatear con Prettier
- `Dev: Check Format` - Verificar formato
- `Dev: Validate HTML` - Validar archivos HTML
- `Dev: Shell Access` - Acceso al contenedor
- `Dev: Show Logs` - Ver logs del contenedor
- `Dev: Clean` - Limpiar contenedores Docker

Alternativas de teclado:
- **Ctrl+Shift+P** → `Tasks: Run Task` → Seleccionar tarea
- **Ctrl+Shift+F1** → Ejecutar última tarea

---

## 📝 Proceso de Contribución

### 1. Crear una Rama

```bash
# Actualizar desde upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crear rama para tu feature/fix
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-problema
```

### 2. Realizar Cambios

- **Escribe código limpio** siguiendo los estándares establecidos
- **Comenta tu código** cuando sea necesario
- **Mantén commits pequeños** y descriptivos
- **Prueba tus cambios** localmente

### 3. Commit y Push

```bash
# Agregar archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad X"

# Push a tu fork
git push origin feature/nombre-descriptivo
```

### 4. Crear Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "Compare & pull request"
3. Completa la plantilla de PR
4. Espera la revisión

---

## 🎯 Tipos de Contribuciones

### 🐛 Corrección de Bugs

- Busca issues existentes antes de crear uno nuevo
- Incluye pasos para reproducir el problema
- Agrega capturas de pantalla si es relevante

### ✨ Nuevas Características

- Discute la característica en un issue primero
- Asegúrate de que se alinee con los objetivos del proyecto
- Incluye documentación y pruebas

### 📚 Documentación

- Mejoras en README, comentarios de código
- Traducciones a otros idiomas
- Guías de usuario y ejemplos

### 🎨 Mejoras de UI/UX

- Mejoras en diseño y usabilidad
- Optimizaciones de rendimiento
- Accesibilidad

---

## 📋 Reportar Problemas

### 🐛 Bugs

Usa esta plantilla para reportar bugs:

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hacia '...'
4. Ve el error

**Comportamiento Esperado**
Lo que esperabas que pasara.

**Capturas de Pantalla**
Si es aplicable, agrega capturas.

**Información del Sistema:**
- OS: [ej. Windows 11]
- Navegador: [ej. Chrome 120]
- Versión: [ej. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

### 💡 Solicitud de Características

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas consideradas**
Otras soluciones o características consideradas.

**Contexto Adicional**
Capturas, mockups, o información adicional.
```

---

## ✅ Estándares de Código

### JavaScript

```javascript
// ✅ Usar camelCase para variables y funciones
const userName = 'juan';
function getUserData() { }

// ✅ Usar PascalCase para clases
class RequirementManager { }

// ✅ Usar UPPER_CASE para constantes
const API_ENDPOINT = 'https://api.example.com';

// ✅ Comentarios descriptivos
/**
 * Calculates the total requirements count
 * @param {Array} requirements - Array of requirement objects
 * @returns {number} Total count
 */
function calculateTotal(requirements) {
    // Implementation
}
```

### HTML

```html
<!-- ✅ Usar atributos semánticos -->
<button 
    id="addRequirement" 
    class="btn btn-primary" 
    aria-label="Agregar nuevo requisito"
    type="button">
    Agregar Requisito
</button>

<!-- ✅ Estructura semántica -->
<section class="requirements-section">
    <h2>Lista de Requisitos</h2>
    <article class="requirement-item">
        <!-- contenido -->
    </article>
</section>
```

### CSS

```css
/* ✅ Usar nombres de clase descriptivos */
.requirement-form {
    /* estilos */
}

.requirement-form__input {
    /* BEM methodology */
}

.requirement-form__input--error {
    /* modificador */
}

/* ✅ Comentarios para secciones */
/* =================================
   Requirements List Styles
   ================================= */
```

### Convenciones de Commit

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar nueva funcionalidad
fix: corregir bug en navegación
docs: actualizar README
style: formatear código
refactor: reestructurar módulo de exportación
test: agregar pruebas unitarias
chore: actualizar dependencias
```

---

## 🧪 Pruebas

### Pruebas Manuales

1. **Funcionalidad Básica**
   - Crear requisitos
   - Editar requisitos
   - Eliminar requisitos
   - Navegación entre pestañas

2. **Compatibilidad de Navegadores**
   - Chrome (últimas 2 versiones)
   - Firefox (últimas 2 versiones)
   - Safari (última versión)
   - Edge (últimas 2 versiones)

3. **Responsividad**
   - Móvil (320px+)
   - Tablet (768px+)
   - Desktop (1024px+)

### Pruebas Automatizadas

```bash
# Ejecutar linter
dev.bat lint

# Validar HTML
dev.bat validate

# Verificar formato
dev.bat format-check

# Ejecutar todas las verificaciones
dev.bat lint && dev.bat validate && dev.bat format-check
```

---

## 📖 Documentación

### Comentarios en Código

```javascript
/**
 * Módulo para gestión de requisitos
 * Proporciona funcionalidades para crear, editar y eliminar requisitos
 * siguiendo la metodología del Systems Engineering Handbook
 */

/**
 * Crea un nuevo requisito en el sistema
 * @param {Object} requirementData - Datos del requisito
 * @param {string} requirementData.function - Función asociada
 * @param {string} requirementData.variable - Variable controlada
 * @param {string} requirementData.component - Componente del sistema
 * @returns {string} ID del requisito creado
 */
function createRequirement(requirementData) {
    // Implementación
}
```

### README y Documentación

- Mantener README.md actualizado
- Documentar nuevas características
- Incluir ejemplos de uso
- Actualizar changelog

---

## 🏆 Reconocimiento

### Colaboradores

Todos los colaboradores son reconocidos en:
- README.md principal
- CONTRIBUTORS.md
- Releases notes

### Tipos de Contribución

Reconocemos diferentes tipos de contribución:
- 💻 Código
- 📖 Documentación
- 🐛 Reportes de bugs
- 💡 Ideas y sugerencias
- 🎨 Diseño
- 🌍 Traducciones
- 📢 Divulgación

---

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/enriquewph/requisador/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/enriquewph/requisador/discussions)
- **Email**: enriquewph@gmail.com

---

## 📄 Código de Conducta

Este proyecto adhiere al [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Al participar, esperamos que mantengas este código.

---

<div align="center">

### 🙏 ¡Gracias por Contribuir!

*Tu ayuda hace que este proyecto sea mejor para toda la comunidad de ingeniería*

**[🔙 Volver al README](README.md)**

</div>
