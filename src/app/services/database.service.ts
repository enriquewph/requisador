import { Injectable, signal } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

export interface Function {
  id?: number;
  name: string;
  description: string;
  order_index: number;
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

export interface ModeComponent {
  mode_id: number;
  component_id: number;
}

export interface Requirement {
  id?: number;
  function_id: number;
  variable_id: number;
  component_id: number;
  mode_id: number;
  parent_id?: number;
  behavior: string;
  tolerance_value?: number;
  tolerance_units?: string;
  justification?: string;
  level: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
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

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: Database | null = null;
  private isInitialized = signal(false);
  
  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/assets/${file}`
      });
      
      this.db = new SQL.Database();
      this.createTables();
      await this.loadInitialData();
      this.isInitialized.set(true);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private createTables(): void {
    if (!this.db) return;

    // Create tables with foreign key constraints
    const sql = `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS functions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS latency_specifications (
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

      CREATE TABLE IF NOT EXISTS tolerance_specifications (
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

      CREATE TABLE IF NOT EXISTS variables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        order_index INTEGER NOT NULL,
        latency_spec_id INTEGER,
        tolerance_spec_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (latency_spec_id) REFERENCES latency_specifications(id),
        FOREIGN KEY (tolerance_spec_id) REFERENCES tolerance_specifications(id)
      );

      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS modes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mode_components (
        mode_id INTEGER NOT NULL,
        component_id INTEGER NOT NULL,
        PRIMARY KEY (mode_id, component_id),
        FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE CASCADE,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        function_id INTEGER NOT NULL,
        variable_id INTEGER NOT NULL,
        component_id INTEGER NOT NULL,
        mode_id INTEGER NOT NULL,
        parent_id INTEGER,
        behavior TEXT NOT NULL,
        tolerance_value REAL,
        tolerance_units TEXT,
        justification TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (function_id) REFERENCES functions(id),
        FOREIGN KEY (variable_id) REFERENCES variables(id),
        FOREIGN KEY (component_id) REFERENCES components(id),
        FOREIGN KEY (mode_id) REFERENCES modes(id),
        FOREIGN KEY (parent_id) REFERENCES requirements(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(sql);
  }

  private async loadInitialData(): Promise<void> {
    try {
      const response = await fetch('/assets/initial-data.json');
      const initialData: InitialData = await response.json();
      
      this.insertInitialData(initialData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  private insertInitialData(data: InitialData): void {
    if (!this.db) return;

    try {
      // Insert latency specifications first (since variables reference them)
      data.latency_specifications?.forEach(latencySpec => {
        this.db!.run(
          'INSERT OR IGNORE INTO latency_specifications (id, name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [latencySpec.id!, latencySpec.name, latencySpec.type, latencySpec.value, latencySpec.units, latencySpec.physical_interpretation, latencySpec.justification]
        );
      });

      // Insert tolerance specifications  
      data.tolerance_specifications?.forEach(toleranceSpec => {
        this.db!.run(
          'INSERT OR IGNORE INTO tolerance_specifications (id, name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [toleranceSpec.id!, toleranceSpec.name, toleranceSpec.type, toleranceSpec.value, toleranceSpec.units, toleranceSpec.physical_interpretation, toleranceSpec.justification]
        );
      });

      // Insert functions
      data.functions.forEach(func => {
        this.db!.run(
          'INSERT OR IGNORE INTO functions (id, name, description, order_index) VALUES (?, ?, ?, ?)',
          [func.id!, func.name, func.description, func.order_index]
        );
      });

      // Insert variables
      data.variables.forEach(variable => {
        this.db!.run(
          'INSERT OR IGNORE INTO variables (id, name, description, order_index, latency_spec_id, tolerance_spec_id) VALUES (?, ?, ?, ?, ?, ?)',
          [variable.id!, variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null]
        );
      });

      // Insert components
      data.components.forEach(component => {
        this.db!.run(
          'INSERT OR IGNORE INTO components (id, name, description, order_index) VALUES (?, ?, ?, ?)',
          [component.id!, component.name, component.description, component.order_index]
        );
      });

      // Insert modes
      data.modes.forEach(mode => {
        this.db!.run(
          'INSERT OR IGNORE INTO modes (id, name, description, order_index) VALUES (?, ?, ?, ?)',
          [mode.id!, mode.name, mode.description, mode.order_index]
        );
      });

      // Insert mode-component associations
      data.mode_components.forEach(mc => {
        this.db!.run(
          'INSERT OR IGNORE INTO mode_components (mode_id, component_id) VALUES (?, ?)',
          [mc.mode_id, mc.component_id]
        );
      });

      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Failed to insert initial data:', error);
    }
  }

  // CRUD Operations for Functions
  getFunctions(): Function[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM functions ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Function);
    }
    stmt.free();
    return results;
  }

  addFunction(func: Omit<Function, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO functions (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([func.name, func.description, func.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateFunction(id: number, func: Omit<Function, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE functions SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([func.name, func.description, func.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteFunction(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM functions WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // CRUD Operations for Variables
  getVariables(): Variable[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM variables ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Variable);
    }
    stmt.free();
    return results;
  }

  addVariable(variable: Omit<Variable, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO variables (name, description, order_index, latency_spec_id, tolerance_spec_id) VALUES (?, ?, ?, ?, ?)');
    stmt.run([variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateVariable(id: number, variable: Omit<Variable, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE variables SET name = ?, description = ?, order_index = ?, latency_spec_id = ?, tolerance_spec_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteVariable(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM variables WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // CRUD Operations for Latency Specifications
  getLatencySpecifications(): LatencySpecification[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM latency_specifications ORDER BY name');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as LatencySpecification);
    }
    stmt.free();
    return results;
  }

  addLatencySpecification(latencySpec: Omit<LatencySpecification, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO latency_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([latencySpec.name, latencySpec.type, latencySpec.value, latencySpec.units, latencySpec.physical_interpretation, latencySpec.justification]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateLatencySpecification(id: number, latencySpec: Omit<LatencySpecification, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE latency_specifications SET name = ?, type = ?, value = ?, units = ?, physical_interpretation = ?, justification = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([latencySpec.name, latencySpec.type, latencySpec.value, latencySpec.units, latencySpec.physical_interpretation, latencySpec.justification, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteLatencySpecification(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM latency_specifications WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // CRUD Operations for Tolerance Specifications
  getToleranceSpecifications(): ToleranceSpecification[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM tolerance_specifications ORDER BY name');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as ToleranceSpecification);
    }
    stmt.free();
    return results;
  }

  addToleranceSpecification(toleranceSpec: Omit<ToleranceSpecification, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO tolerance_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([toleranceSpec.name, toleranceSpec.type, toleranceSpec.value, toleranceSpec.units, toleranceSpec.physical_interpretation, toleranceSpec.justification]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateToleranceSpecification(id: number, toleranceSpec: Omit<ToleranceSpecification, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE tolerance_specifications SET name = ?, type = ?, value = ?, units = ?, physical_interpretation = ?, justification = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([toleranceSpec.name, toleranceSpec.type, toleranceSpec.value, toleranceSpec.units, toleranceSpec.physical_interpretation, toleranceSpec.justification, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteToleranceSpecification(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM tolerance_specifications WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Get variable with its latency specification
  // Get variable with its latency and tolerance specifications
  getVariableWithSpecifications(variableId: number): (Variable & { latency_spec?: LatencySpecification, tolerance_spec?: ToleranceSpecification }) | null {
    if (!this.db) return null;
    const stmt = this.db.prepare(`
      SELECT v.*, 
             ls.name as latency_name, ls.type as latency_type, ls.value as latency_value, 
             ls.units as latency_units, ls.physical_interpretation as latency_interpretation, ls.justification as latency_justification,
             ts.name as tolerance_name, ts.type as tolerance_type, ts.value as tolerance_value,
             ts.units as tolerance_units, ts.physical_interpretation as tolerance_interpretation, ts.justification as tolerance_justification
      FROM variables v
      LEFT JOIN latency_specifications ls ON v.latency_spec_id = ls.id
      LEFT JOIN tolerance_specifications ts ON v.tolerance_spec_id = ts.id
      WHERE v.id = ?
    `);
    stmt.bind([variableId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      const variable = {
        id: row['id'] as number,
        name: row['name'] as string,
        description: row['description'] as string,
        order_index: row['order_index'] as number,
        latency_spec_id: row['latency_spec_id'] as number,
        tolerance_spec_id: row['tolerance_spec_id'] as number,
        created_at: row['created_at'] as string,
        updated_at: row['updated_at'] as string
      };

      if (row['latency_name']) {
        (variable as any).latency_spec = {
          id: row['latency_spec_id'] as number,
          name: row['latency_name'] as string,
          type: row['latency_type'] as string,
          value: row['latency_value'] as number,
          units: row['latency_units'] as string,
          physical_interpretation: row['latency_interpretation'] as string,
          justification: row['latency_justification'] as string
        };
      }

      if (row['tolerance_name']) {
        (variable as any).tolerance_spec = {
          id: row['tolerance_spec_id'] as number,
          name: row['tolerance_name'] as string,
          type: row['tolerance_type'] as string,
          value: row['tolerance_value'] as number,
          units: row['tolerance_units'] as string,
          physical_interpretation: row['tolerance_interpretation'] as string,
          justification: row['tolerance_justification'] as string
        };
      }
      
      return variable;
    }
    stmt.free();
    return null;
  }

  // CRUD Operations for Components
  getComponents(): Component[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM components ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Component);
    }
    stmt.free();
    return results;
  }

  addComponent(component: Omit<Component, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO components (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([component.name, component.description, component.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateComponent(id: number, component: Omit<Component, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE components SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([component.name, component.description, component.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteComponent(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM components WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // CRUD Operations for Modes
  getModes(): Mode[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM modes ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Mode);
    }
    stmt.free();
    return results;
  }

  addMode(mode: Omit<Mode, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO modes (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([mode.name, mode.description, mode.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateMode(id: number, mode: Omit<Mode, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE modes SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([mode.name, mode.description, mode.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteMode(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM modes WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Mode-Component associations
  getModeComponents(): ModeComponent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM mode_components');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as ModeComponent);
    }
    stmt.free();
    return results;
  }

  addModeComponent(modeId: number, componentId: number): boolean {
    if (!this.db) return false;
    try {
      const stmt = this.db.prepare('INSERT INTO mode_components (mode_id, component_id) VALUES (?, ?)');
      stmt.run([modeId, componentId]);
      stmt.free();
      return true;
    } catch (error) {
      console.error('Failed to add mode-component association:', error);
      return false;
    }
  }

  removeModeComponent(modeId: number, componentId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE mode_id = ? AND component_id = ?');
    stmt.run([modeId, componentId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Remove all mode-component associations for a specific component
  removeComponentAssociations(componentId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE component_id = ?');
    stmt.run([componentId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Remove all mode-component associations for a specific mode
  removeModeAssociations(modeId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE mode_id = ?');
    stmt.run([modeId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Get modes that have no component associations
  getOrphanedModes(): Mode[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT m.* FROM modes m 
      LEFT JOIN mode_components mc ON m.id = mc.mode_id 
      WHERE mc.mode_id IS NULL
    `);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Mode);
    }
    stmt.free();
    return results;
  }

  // CRUD Operations for Requirements
  getRequirements(): Requirement[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM requirements ORDER BY level, order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Requirement);
    }
    stmt.free();
    return results;
  }

  addRequirement(requirement: Omit<Requirement, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare(`
      INSERT INTO requirements 
      (function_id, variable_id, component_id, mode_id, parent_id, behavior, level, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      requirement.function_id,
      requirement.variable_id,
      requirement.component_id,
      requirement.mode_id,
      requirement.parent_id || null,
      requirement.behavior,
      requirement.level,
      requirement.order_index
    ]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateRequirement(id: number, requirement: Omit<Requirement, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare(`
      UPDATE requirements SET 
      function_id = ?, variable_id = ?, component_id = ?, mode_id = ?, 
      parent_id = ?, behavior = ?, level = ?, order_index = ?, 
      updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run([
      requirement.function_id,
      requirement.variable_id,
      requirement.component_id,
      requirement.mode_id,
      requirement.parent_id || null,
      requirement.behavior,
      requirement.level,
      requirement.order_index,
      id
    ]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  deleteRequirement(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM requirements WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Get requirements by parent (for hierarchical structure)
  getRequirementsByParent(parentId: number | null): Requirement[] {
    if (!this.db) return [];
    const stmt = parentId 
      ? this.db.prepare('SELECT * FROM requirements WHERE parent_id = ? ORDER BY order_index')
      : this.db.prepare('SELECT * FROM requirements WHERE parent_id IS NULL ORDER BY order_index');
    
    if (parentId) {
      stmt.bind([parentId]);
    }
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Requirement);
    }
    stmt.free();
    return results;
  }

  // Generate next order index for requirements
  getNextRequirementOrderIndex(parentId: number | null): number {
    if (!this.db) return 0;
    const stmt = parentId
      ? this.db.prepare('SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM requirements WHERE parent_id = ?')
      : this.db.prepare('SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM requirements WHERE parent_id IS NULL');
    
    if (parentId) {
      stmt.bind([parentId]);
    }
    
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result['next_order'] as number;
    }
    stmt.free();
    return 0;
  }

  // Generate requirement ID based on hierarchy (R0, R1, R1-0, etc.)
  generateRequirementId(requirement: Requirement): string {
    if (!this.db) return 'R0';
    
    if (!requirement.parent_id) {
      // Top-level requirement
      return `R${requirement.order_index}`;
    } else {
      // Child requirement - get parent ID and append child index
      const stmt = this.db.prepare('SELECT * FROM requirements WHERE id = ?');
      stmt.bind([requirement.parent_id]);
      
      if (stmt.step()) {
        const parent = stmt.getAsObject() as unknown as Requirement;
        const parentId = this.generateRequirementId(parent);
        stmt.free();
        return `${parentId}-${requirement.order_index}`;
      }
      stmt.free();
      return `R${requirement.order_index}`;
    }
  }

  // Export database as Uint8Array for backup
  exportDatabase(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  // Check if database is ready
  isDatabaseReady(): boolean {
    return this.isInitialized();
  }
}
