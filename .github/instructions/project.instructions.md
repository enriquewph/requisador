# Copilot Instructions for Requisador de Requisitos

## Project Overview
This is a professional requirements management web application built with Angular 20+ that helps systems engineers create, organize, and manage behavioral and performance requirements. The app follows Systems Engineering Handbook methodology with a structured workflow: Configure → Create → Manage → Export.

## Architecture & Technologies
- **Framework**: Angular 20+ with standalone components (no NgModules)
- **Styling**: TailwindCSS with custom CSS variables (`--primary-color: #605DC8`)
- **Database**: SQLite with foreign key constraints (client-side storage)
- **TypeScript**: Strict mode enabled with modern ES2022 target
- **Build**: Static site generation for deployment

## Database Architecture
📖 **See complete database documentation: [`docs/DATABASE_DOCUMENTATION.md`](../docs/DATABASE_DOCUMENTATION.md)**

The application uses a modular repository pattern with SQLite for data persistence:
- **Repository Pattern**: Each entity has its own repository class
- **Type Safety**: Comprehensive TypeScript interfaces
- **Schema Management**: Automated table creation and data loading
- **Performance**: Indexed queries and prepared statements

## Core Domain Model
The application manages four foundational entities with specific relationships:

1. **Functions**: System capabilities ("Navigation", "Communication")
2. **Variables**: Controlled parameters ("Speed", "Position") 
3. **Components**: System parts ("HMI", "ECI")
4. **Modes**: Operating conditions ("Normal", "Emergency")
5. **Requirements**: Generated using the pattern: `"El [Component] deberá [Behavior] [Variable] cuando el sistema esté en modo [Mode]"`

### Key Relationships
- Components ↔ Modes: Many-to-many (mode_components junction table)
- Requirements: Self-referencing parent-child hierarchy (R0, R1, R1-0, R1-1, etc.)
- All entities → Requirements: One-to-many with foreign key constraints

## Development Patterns

### Angular Conventions (Follow Strictly)
- **Components**: Always standalone, use `input()`/`output()` functions, `ChangeDetectionStrategy.OnPush`
- **Templates**: Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- **State**: Signals for component state, `computed()` for derived state
- **Forms**: Reactive forms only, no template-driven forms
- **Styling**: Use `class` and `style` bindings, never `ngClass`/`ngStyle`

### Project-Specific Conventions
- **Entity Management**: All CRUD operations follow the same pattern with validation and duplicate prevention
- **Hierarchical Requirements**: Use `parent_id` and `level` fields for tree structure
- **Color Coding**: Functions (blue), Variables (green), Components (indigo), Modes (purple)
- **ID Generation**: Automatic hierarchical IDs (R0, R1-0, R1-1-0) based on parent-child relationships

### Data Layer Patterns
- **Database Schema**: Normalized SQLite with foreign key constraints
- **Service Architecture**: Single responsibility services with `providedIn: 'root'`
- **Migration Support**: Handle localStorage to SQLite migration gracefully
- **Error Handling**: Validate entity references before requirement creation

## Key Workflows

### Requirements Creation Wizard (5-step process)
1. Select Function + Variable
2. Choose Parent Requirement (optional)
3. Select Component + Mode (validate mode-component association)
4. Write Behavior Description
5. Preview & Confirm generated requirement text

### Configuration Management
- CRUD operations for all entities with real-time validation
- Drag-and-drop reordering with `order_index` field
- Many-to-many Mode-Component associations
- Bulk operations with referential integrity checks

## Build & Development Commands
```bash
npm start              # Development server
npm run build          # Production build
npm run watch          # Development build with file watching
```

## Critical Implementation Notes
- **Offline-First**: SQLite runs client-side for offline functionality
- **Export Formats**: Support JSON and CSV export with complete state backup
- **Performance**: Implement virtual scrolling for large requirement lists
- **Accessibility**: ARIA labels and keyboard navigation required
- **Validation**: Enforce business rules (valid entity references, hierarchy constraints)

## File Organization
- `src/app/`: Main application components and services
- Entity-specific modules should follow the same CRUD pattern
- Use inline templates for small components per Angular configuration
- Global styles in `styles.css` with CSS custom properties for theming
