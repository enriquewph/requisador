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

export interface Variable {
  id?: number;
  name: string;
  description: string;
  order_index: number;
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

      CREATE TABLE IF NOT EXISTS variables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
          'INSERT OR IGNORE INTO variables (id, name, description, order_index) VALUES (?, ?, ?, ?)',
          [variable.id!, variable.name, variable.description, variable.order_index]
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
    const stmt = this.db.prepare('INSERT INTO variables (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([variable.name, variable.description, variable.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  updateVariable(id: number, variable: Omit<Variable, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE variables SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([variable.name, variable.description, variable.order_index, id]);
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
