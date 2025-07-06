# 🚀 Guía de Desarrollo - Requisador de Requisitos

Esta guía está diseñada para desarrolladores que deseen contribuir al proyecto o establecer un entorno de desarrollo local.

## 📋 Prerrequisitos

- **Node.js** v18 o superior
- **Git** para control de versiones
- **Visual Studio Code** (recomendado) con las extensiones sugeridas
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## 🛠️ Configuración del Entorno de Desarrollo

### 1. Clonar el Repositorio

```bash
git clone https://github.com/enriquewph/requisador.git
cd requisador
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar VS Code (Opcional pero Recomendado)

El proyecto incluye configuraciones específicas para VS Code:

- Abre el archivo `requisador.code-workspace`
- Instala las extensiones recomendadas cuando VS Code las sugiera
- Las configuraciones de formato y linting se aplicarán automáticamente

### 4. Iniciar el Servidor de Desarrollo

```bash
# Opción 1: Usar Node.js
npm run dev

# Opción 2: Usar Python (si está disponible)
npm start

# Opción 3: Usar el script incluido (Windows)
npm run start:win

# Opción 4: Usar el script incluido (Unix/Linux/Mac)
npm run start:unix
```

La aplicación estará disponible en `http://localhost:3000` (Node.js) o `http://localhost:8000` (Python).

## 📁 Estructura del Proyecto

```
requisador/
├── src/                          # Código fuente principal
│   ├── index.html               # Página principal
│   ├── css/
│   │   └── styles.css           # Estilos principales
│   ├── js/
│   │   ├── core/
│   │   │   ├── app.js           # Lógica principal de la aplicación
│   │   │   └── config.js        # Configuraciones y constantes
│   │   ├── modules/
│   │   │   ├── export.js        # Funcionalidad de exportación
│   │   │   └── requirements.js  # Gestión de requisitos
│   │   └── utils/
│   │       ├── init.js          # Inicialización
│   │       └── page-loader.js   # Carga dinámica de páginas
│   ├── pages/                   # Páginas dinámicas
│   │   ├── config.html
│   │   ├── create.html
│   │   ├── guidelines.html
│   │   ├── list.html
│   │   └── tree.html
│   ├── components/              # Componentes reutilizables
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── about-modal.html
│   └── assets/                  # Recursos estáticos
│       └── favicon.svg
├── .github/
│   └── workflows/               # GitHub Actions workflows
├── docs/                        # Documentación del proyecto
└── scripts/                     # Scripts de utilidad
```

## 🧪 Scripts de Desarrollo Disponibles

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run serve        # Servidor HTTP alternativo
```

### Build y Optimización
```bash
npm run build        # Construir versión optimizada
npm run build:clean  # Limpiar directorio de distribución
npm run build:copy   # Copiar archivos fuente
npm run build:minify # Minificar archivos
```

### Calidad de Código
```bash
npm run lint:js      # Linter para JavaScript
npm run lint:css     # Linter para CSS
npm run validate:html # Validar archivos HTML
npm run format       # Formatear código
npm run format:check # Verificar formato sin cambiar
```

### Testing
```bash
npm test             # Ejecutar tests (cuando estén disponibles)
```

## 🎨 Estándares de Código

### JavaScript
- Usar ES6+ features cuando sea apropiado
- Seguir las reglas de ESLint configuradas
- Documentar funciones complejas con JSDoc
- Usar `const` y `let` en lugar de `var`

### HTML
- Usar HTML5 semántico
- Incluir atributos `alt` en imágenes
- Mantener la estructura accesible

### CSS
- Seguir la metodología BEM para nombres de clases
- Usar Tailwind CSS para estilos utilitarios
- Organizar estilos personalizados en `styles.css`

### Commits
- Usar mensajes descriptivos en español
- Incluir `[release]` en el mensaje para activar releases automáticos
- Seguir el formato: `tipo: descripción breve`

Ejemplos:
```
feat: agregar funcionalidad de exportación a PDF
fix: corregir navegación entre pestañas
docs: actualizar guía de instalación
style: mejorar espaciado en formularios
```

## 🔧 Configuración de Herramientas

### ESLint
La configuración está en `.eslintrc.js` e incluye:
- Reglas estándar de JavaScript
- Configuración específica para navegadores
- Variables globales del proyecto

### Prettier
La configuración está en `.prettierrc` con:
- Configuración estándar para formateo
- Reglas específicas para HTML y CSS

### VS Code
El workspace incluye:
- Configuraciones de formato automático
- Extensiones recomendadas
- Configuración de Live Server

## 🚀 Flujo de Trabajo de Desarrollo

### 1. Crear una Branch
```bash
git checkout -b feature/nueva-funcionalidad
```

### 2. Desarrollar
- Hacer cambios en el código
- Probar localmente
- Verificar que no hay errores de linting

### 3. Confirmar Cambios
```bash
git add .
git commit -m "feat: descripción de la nueva funcionalidad"
```

### 4. Subir y Crear PR
```bash
git push origin feature/nueva-funcionalidad
```

Luego crear un Pull Request en GitHub.

## 🌐 Deployment

### GitHub Pages with Custom Domain (Automático)
- Los pushes a `main` activan deployment automático a **https://enriquewph.com.ar/requisador/**
- El workflow optimiza archivos antes del deployment
- Incluye validación HTML, minificación y health checks
- El dominio personalizado se configura automáticamente via CNAME

### Configuración del Dominio Personalizado
1. **DNS**: CNAME record apuntando `enriquewph.com.ar` a `enriquewph.github.io`
2. **GitHub Pages**: Configurar dominio personalizado en Settings > Pages
3. **SSL**: Se genera automáticamente después de la propagación DNS

### Manual
```bash
npm run build
# Los archivos optimizados estarán en la carpeta 'dist'
```

## 🐛 Debugging

### Logs de Desarrollo
El proyecto incluye logs extensivos para debugging:
- Activar logs en la consola del navegador
- Verificar el tab de Network para problemas de carga
- Usar las herramientas de desarrollo del navegador

### Problemas Comunes

1. **Tabs no funcionan**: Verificar que `setupTabNavigation()` esté siendo llamado
2. **Páginas no cargan**: Revisar logs de PageLoader en la consola
3. **Estilos no se aplican**: Limpiar caché del navegador
4. **Modal no aparece**: Verificar que las funciones del modal estén definidas

## 📊 Monitoring y Mantenimiento

### Health Checks Automáticos
- Verificación cada 6 horas de la disponibilidad del sitio
- Monitoreo de CDNs externos
- Checks de rendimiento automáticos

### Actualización de Dependencias
- Verificación semanal automática de versiones de Tailwind CSS
- Creación automática de PRs para actualizaciones
- Validación de compatibilidad antes del merge

## 🤝 Contribuir

1. Hacer fork del repositorio
2. Crear una branch para tu feature
3. Seguir los estándares de código
4. Incluir tests si es necesario
5. Crear un Pull Request con descripción clara

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/enriquewph/requisador/issues)
- **Documentación**: Revisar el README.md principal
- **Desarrollo**: Consultar esta guía de desarrollo

---

¡Gracias por contribuir al proyecto! 🚀
