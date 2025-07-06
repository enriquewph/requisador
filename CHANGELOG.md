# Changelog

All notable changes to the Requisador de Requisitos project will be documented in this file.

## [2.0.0] - 2025-07-04

### 🚀 Major Restructuring
- **BREAKING**: Moved all source files to `/src/` directory for clean deployment structure
- Reorganized project with clear separation between source code and documentation
- Updated server scripts to serve from `/src/` directory

### ✨ Added
- Modular architecture with separate HTML components for each tab
- Dynamic page loading system using fetch API
- Centralized configuration management
- Component-based structure (header, footer, modal)
- Separate page files for each application tab
- Improved development and deployment workflow

### 🔧 Fixed
- Resolved JavaScript `moveRequirementUp is not defined` error
- Fixed CORS issues with local file access
- Suppressed Tailwind CSS production warnings
- Eliminated all console errors and warnings

### 📝 Documentation
- Streamlined documentation to essential README and CHANGELOG only
- Added MIT License
- Updated installation and usage instructions
- Removed redundant documentation files

### 🗂️ Project Structure
```
requisador/
├── src/                 # All source files (deployment ready)
├── start-server.bat     # Windows server script  
├── start-server.sh      # Linux/Mac server script
├── README.md           # Main documentation
├── CHANGELOG.md        # This file
└── LICENSE             # MIT License
```

## [1.0.0] - 2025-06-XX

### ✨ Initial Release
- Requirements management tool following Systems Engineering Handbook methodology
- Interactive requirement creation wizard
- Real-time preview and validation
- Export functionality (CSV, LaTeX, JSON)
- Local storage with project import/export
- Responsive design with modern UI
- Tab-based navigation system
