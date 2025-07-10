# Changelog

All notable changes to the Requisador de Requisitos project will be documented in this file.

## [1.0.0] - 2025-07-09

### 🚀 MAJOR VERSION RELEASE
- **BREAKING**: Architecture migration from localStorage to SQLite database
- **NEW**: Normalized database schema with proper relational structure
- **NEW**: ID-based referencing for all entities (functions, variables, components, modes, requirements)
- **NEW**: Hierarchical requirements with parent-child relationships using foreign keys
- **NEW**: Many-to-many relationship between modes and components
- **NEW**: Data migration utilities for upgrading from v0.2.x localStorage format

### 🗄️ Database Schema
- `functions` table with auto-incrementing IDs
- `variables` table with auto-incrementing IDs  
- `components` table with auto-incrementing IDs
- `modes` table with auto-incrementing IDs
- `mode_components` junction table for many-to-many relationships
- `requirements` table with foreign key references to all related entities
- `metadata` table for version tracking and migration information
- Proper indexes for query performance
- Cascade delete for data integrity

### 🔄 Migration Features
- Automatic data migration from localStorage v0.2.x format
- Backward compatibility during transition period
- SQL generation utilities for database creation and data insertion
- Version tracking for future schema updates

### 🎨 UI/UX Improvements
- Polished configuration tab with modern, seamless input-button combinations
- Consistent rounded borders matching overall design language
- Icon-only add buttons for cleaner interface
- Fixed button transparency issues with proper CSS specificity
- Massive CSS cleanup: reduced from 776 to 389 lines (50% reduction)
- Better organized, maintainable stylesheet structure

### 📊 Technical Improvements
- Centralized version management with database schema versioning
- Enhanced project export format (v3.0) for SQLite compatibility
- Improved error handling and debugging capabilities
- Clean separation of concerns between data layer and UI

### 🧹 Code Quality
- Removed legacy "Ambos" component references
- Cleaned up redundant CSS rules and consolidated related styles
- Better organized file structure and imports
- Comprehensive documentation for database schema and migration

## [0.2.2] - 2025-07-08

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
