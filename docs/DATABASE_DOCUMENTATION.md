# Database Documentation - Requisador de Requisitos

## Overview
This document provides comprehensive documentation for the database structure, interfaces, schema, and all available methods in the Requisador de Requisitos application. The application uses SQLite with a repository pattern for clean architecture and maintainability.

## Architecture

### Repository Pattern
The application implements a modular repository pattern with the following structure:

```
src/app/services/
├── database.service.ts           # Main service orchestrator
└── database/
    ├── interfaces.ts            # TypeScript interfaces
    ├── schema.ts               # Database schema management
    ├── functions.repository.ts
    ├── variables.repository.ts
    ├── components.repository.ts
    ├── modes.repository.ts
    ├── latency-specifications.repository.ts
    ├── tolerance-specifications.repository.ts
    └── requirements.repository.ts
```

### Main Database Service
```typescript
// Access repositories through DatabaseService
constructor(private db: DatabaseService) {}

// Usage examples:
this.db.functions.getAll()
this.db.requirements.add(requirement)
this.db.schema.createTables()
```

## Database Schema

### Core Tables

#### 1. functions
System capabilities or functions
```sql
CREATE TABLE functions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. tolerance_specifications
Tolerance specifications for variables
```sql
CREATE TABLE tolerance_specifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Absoluta', 'Relativa', 'Estadística', 'Funcional')),
  value REAL NOT NULL,
  units TEXT NOT NULL,
  physical_interpretation TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. latency_specifications
Latency specifications for variables
```sql
CREATE TABLE latency_specifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Real', 'Digital', 'Virtual', 'Discrete')),
  value REAL NOT NULL,
  units TEXT NOT NULL,
  physical_interpretation TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. variables
Controlled parameters with optional specifications
```sql
CREATE TABLE variables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  latency_spec_id INTEGER,
  tolerance_spec_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (latency_spec_id) REFERENCES latency_specifications(id),
  FOREIGN KEY (tolerance_spec_id) REFERENCES tolerance_specifications(id)
);
```

#### 5. components
System components or parts
```sql
CREATE TABLE components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. modes
Operating conditions or modes
```sql
CREATE TABLE modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. mode_components
Many-to-many relationship between modes and components
```sql
CREATE TABLE mode_components (
  mode_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  PRIMARY KEY (mode_id, component_id),
  FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);
```

#### 8. requirements
Main requirements table with hierarchical structure
```sql
CREATE TABLE requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  function_id INTEGER NOT NULL,
  variable_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  mode_id INTEGER NOT NULL,
  parent_id INTEGER,
  behavior TEXT NOT NULL,
  condition TEXT,
  justification TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (function_id) REFERENCES functions(id),
  FOREIGN KEY (variable_id) REFERENCES variables(id),
  FOREIGN KEY (component_id) REFERENCES components(id),
  FOREIGN KEY (mode_id) REFERENCES modes(id),
  FOREIGN KEY (parent_id) REFERENCES requirements(id) ON DELETE CASCADE
);
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_variables_latency_spec ON variables(latency_spec_id);
CREATE INDEX idx_variables_tolerance_spec ON variables(tolerance_spec_id);
CREATE INDEX idx_requirements_function ON requirements(function_id);
CREATE INDEX idx_requirements_variable ON requirements(variable_id);
CREATE INDEX idx_requirements_component ON requirements(component_id);
CREATE INDEX idx_requirements_mode ON requirements(mode_id);
CREATE INDEX idx_requirements_parent ON requirements(parent_id);
CREATE INDEX idx_requirements_level ON requirements(level);
```

## TypeScript Interfaces

### Core Entity Interfaces

```typescript
export interface Function {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Variable {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  latency_spec_id?: number;
  tolerance_spec_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Component {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Mode {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Requirement {
  id?: number;
  function_id: number;
  variable_id: number;
  component_id: number;
  mode_id: number;
  parent_id?: number;
  behavior: string;
  condition?: string;
  justification?: string;
  level: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface LatencySpecification {
  id?: number;
  name: string;
  type: 'Real' | 'Digital' | 'Virtual' | 'Discrete';
  value: number;
  units: string;
  physical_interpretation: string;
  justification: string;
  created_at?: string;
  updated_at?: string;
}

export interface ToleranceSpecification {
  id?: number;
  name: string;
  type: 'Absoluta' | 'Relativa' | 'Estadística' | 'Funcional';
  value: number;
  units: string;
  physical_interpretation: string;
  justification: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModeComponent {
  mode_id: number;
  component_id: number;
}

export interface VariableWithSpecifications extends Variable {
  latency_spec?: LatencySpecification;
  tolerance_spec?: ToleranceSpecification;
}

export interface InitialData {
  functions: Function[];
  variables: Variable[];
  components: Component[];
  modes: Mode[];
  mode_components: ModeComponent[];
  latency_specifications: LatencySpecification[];
  tolerance_specifications: ToleranceSpecification[];
}
```

## Repository Methods

### FunctionsRepository (`db.functions`)

#### CRUD Operations
- `getAll()`: Function[] - Get all functions ordered by order_index
- `add(func: Omit<Function, 'id'>)`: boolean - Add new function
- `update(id: number, func: Omit<Function, 'id'>)`: boolean - Update function
- `delete(id: number)`: boolean - Delete function

#### Utility Methods
- `getNextOrderIndex()`: number - Get next available order index

### VariablesRepository (`db.variables`)

#### CRUD Operations
- `getAll()`: Variable[] - Get all variables ordered by order_index
- `add(variable: Omit<Variable, 'id'>)`: boolean - Add new variable
- `update(id: number, variable: Omit<Variable, 'id'>)`: boolean - Update variable
- `delete(id: number)`: boolean - Delete variable

#### Special Methods
- `getWithSpecifications(variableId: number)`: VariableWithSpecifications | null - Get variable with joined latency and tolerance specifications
- `getNextOrderIndex()`: number - Get next available order index

### ComponentsRepository (`db.components`)

#### CRUD Operations
- `getAll()`: Component[] - Get all components ordered by order_index
- `add(component: Omit<Component, 'id'>)`: boolean - Add new component
- `update(id: number, component: Omit<Component, 'id'>)`: boolean - Update component
- `delete(id: number)`: boolean - Delete component

#### Utility Methods
- `getNextOrderIndex()`: number - Get next available order index

### ModesRepository (`db.modes`)

#### CRUD Operations
- `getAll()`: Mode[] - Get all modes ordered by order_index
- `add(mode: Omit<Mode, 'id'>)`: boolean - Add new mode
- `update(id: number, mode: Omit<Mode, 'id'>)`: boolean - Update mode
- `delete(id: number)`: boolean - Delete mode

#### Mode-Component Association Methods
- `getModeComponents()`: ModeComponent[] - Get all mode-component associations
- `addModeComponent(modeId: number, componentId: number)`: boolean - Add mode-component association
- `removeModeComponent(modeId: number, componentId: number)`: boolean - Remove specific mode-component association
- `removeComponentAssociations(componentId: number)`: boolean - Remove all associations for a component
- `removeModeAssociations(modeId: number)`: boolean - Remove all associations for a mode
- `getOrphanedModes()`: Mode[] - Get modes with no component associations

#### Utility Methods
- `isModeComponentAssociated(modeId: number, componentId: number)`: boolean - Check if mode-component association exists
- `getModeComponentCount(modeId: number)`: number - Get count of components associated with a mode
- `getNextOrderIndex()`: number - Get next available order index

### LatencySpecificationsRepository (`db.latencySpecifications`)

#### CRUD Operations
- `getAll()`: LatencySpecification[] - Get all latency specifications ordered by name
- `add(latencySpec: Omit<LatencySpecification, 'id'>)`: boolean - Add new latency specification
- `update(id: number, latencySpec: Omit<LatencySpecification, 'id'>)`: boolean - Update latency specification
- `delete(id: number)`: boolean - Delete latency specification

### ToleranceSpecificationsRepository (`db.toleranceSpecifications`)

#### CRUD Operations
- `getAll()`: ToleranceSpecification[] - Get all tolerance specifications ordered by name
- `add(toleranceSpec: Omit<ToleranceSpecification, 'id'>)`: boolean - Add new tolerance specification
- `update(id: number, toleranceSpec: Omit<ToleranceSpecification, 'id'>)`: boolean - Update tolerance specification
- `delete(id: number)`: boolean - Delete tolerance specification

### RequirementsRepository (`db.requirements`)

#### CRUD Operations
- `getAll()`: Requirement[] - Get all requirements ordered by level and order_index
- `add(requirement: Omit<Requirement, 'id'>)`: boolean - Add new requirement
- `update(id: number, requirement: Omit<Requirement, 'id'>)`: boolean - Update requirement
- `delete(id: number)`: boolean - Delete requirement and all children recursively

#### Hierarchical Methods
- `getByParent(parentId: number | null)`: Requirement[] - Get requirements by parent (null for root level)
- `getNextRequirementOrderIndex(parentId: number | null)`: number - Get next order index for new requirement
- `generateRequirementId(requirement: Requirement)`: string - Generate hierarchical ID (R0, R1-0, R1-1-0, etc.)

#### Utility Methods
- `getMaxLevel()`: number - Get maximum level in requirements hierarchy

### SchemaManager (`db.schema`)

#### Database Management
- `createTables()`: boolean - Create all database tables and indexes
- `loadInitialData()`: Promise<boolean> - Load initial data from assets/initial-data.json
- `insertInitialData(data: InitialData)`: boolean - Insert provided initial data
- `clearAllData()`: boolean - Clear all data from all tables
- `dropTables()`: boolean - Drop all database tables

#### Information Methods
- `getTableInfo(tableName: string)`: any[] - Get table structure information
- `getRowCount(tableName: string)`: number - Get row count for specific table

## DatabaseService Main Methods

### Initialization & Status
- `isReady()`: boolean - Check if database is initialized and ready
- `getDatabase()`: Database | null - Get raw SQLite database instance

### Database Management
- `resetDatabase()`: Promise<void> - Clear all data and reload initial data
- `exportDatabase()`: Uint8Array | null - Export database as binary data for backup
- `importDatabase(data: Uint8Array)`: Promise<boolean> - Import database from binary data

## Usage Examples

### Basic CRUD Operations
```typescript
// Get all functions
const functions = this.db.functions.getAll();

// Add new function
const success = this.db.functions.add({
  name: 'Navigation',
  description: 'System navigation capabilities',
  order_index: 0
});

// Update function
const updated = this.db.functions.update(1, {
  name: 'Enhanced Navigation',
  description: 'Advanced navigation capabilities',
  order_index: 0
});

// Delete function
const deleted = this.db.functions.delete(1);
```

### Working with Variables and Specifications
```typescript
// Get variable with specifications
const variableWithSpecs = this.db.variables.getWithSpecifications(1);
if (variableWithSpecs?.latency_spec) {
  console.log(`Latency: ${variableWithSpecs.latency_spec.value} ${variableWithSpecs.latency_spec.units}`);
}

// Add variable with specifications
const variable = this.db.variables.add({
  name: 'Speed',
  description: 'Vehicle speed',
  order_index: 0,
  latency_spec_id: 1,
  tolerance_spec_id: 2
});
```

### Mode-Component Associations
```typescript
// Check if mode and component are associated
const isAssociated = this.db.modes.isModeComponentAssociated(1, 2);

// Add association
this.db.modes.addModeComponent(1, 2);

// Remove all associations for a component
this.db.modes.removeComponentAssociations(2);

// Get orphaned modes (modes with no components)
const orphanedModes = this.db.modes.getOrphanedModes();
```

### Requirements Hierarchy
```typescript
// Get all top-level requirements
const topLevelReqs = this.db.requirements.getByParent(null);

// Get child requirements
const childReqs = this.db.requirements.getByParent(1);

// Generate requirement ID
const req = this.db.requirements.getAll()[0];
const reqId = this.db.requirements.generateRequirementId(req); // "R0"

// Get next order index for new child requirement
const nextOrder = this.db.requirements.getNextRequirementOrderIndex(1);
```

### Database Management
```typescript
// Check if database is ready
if (this.db.isReady()) {
  // Perform operations
}

// Reset database to initial state
await this.db.resetDatabase();

// Export database for backup
const backupData = this.db.exportDatabase();

// Import database from backup
const success = await this.db.importDatabase(backupData);
```

## Error Handling

All repository methods include proper error handling:
- Methods return `false` or `null` on failure
- Database operations use try-catch blocks
- SQL prepared statements are properly freed after use
- Foreign key constraints are enforced

## Performance Considerations

- All tables have appropriate indexes for common queries
- Prepared statements are used for all SQL operations
- Large result sets should be paginated in future versions
- Database operations are synchronous (SQLite in-memory/client-side)

## Migration Strategy

The application supports database migrations through the SchemaManager:
- Version tracking can be added in future updates
- Initial data loading is handled gracefully
- Database structure changes can be managed through schema updates

---

*Last updated: January 2025*
*Version: 1.0.0*
