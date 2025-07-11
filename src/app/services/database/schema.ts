import { Database } from 'sql.js';
import { InitialData } from './interfaces';

export class SchemaManager {
  constructor(private db: Database | null) {}

  createTables(): boolean {
    if (!this.db) return false;

    try {
      // Create tables
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS functions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
          order_index INTEGER NOT NULL,
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

        CREATE TABLE IF NOT EXISTS variables (
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

        CREATE TABLE IF NOT EXISTS components (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS modes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
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
      `);

      // Create indexes for performance
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_variables_latency_spec ON variables(latency_spec_id);
        CREATE INDEX IF NOT EXISTS idx_variables_tolerance_spec ON variables(tolerance_spec_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_function ON requirements(function_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_variable ON requirements(variable_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_component ON requirements(component_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_mode ON requirements(mode_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_parent ON requirements(parent_id);
        CREATE INDEX IF NOT EXISTS idx_requirements_level ON requirements(level);
      `);

      return true;
    } catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }

  async loadInitialData(): Promise<boolean> {
    if (!this.db) return false;

    try {
      // Fetch initial data from assets
      const response = await fetch('/assets/initial-data.json');
      if (!response.ok) {
        console.error('Failed to fetch initial data');
        return false;
      }

      const initialData: InitialData = await response.json();
      return this.insertInitialData(initialData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      return false;
    }
  }

  insertInitialData(data: InitialData): boolean {
    if (!this.db) return false;

    try {
      // Insert functions
      if (data.functions?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO functions (name, description, order_index) VALUES (?, ?, ?)');
        data.functions.forEach(func => {
          stmt.run([func.name, func.description, func.order_index]);
        });
        stmt.free();
      }

      // Insert tolerance specifications
      if (data.tolerance_specifications?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO tolerance_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
        data.tolerance_specifications.forEach(spec => {
          stmt.run([spec.name, spec.type, spec.value, spec.units, spec.physical_interpretation, spec.justification]);
        });
        stmt.free();
      }

      // Insert latency specifications
      if (data.latency_specifications?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO latency_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
        data.latency_specifications.forEach(spec => {
          stmt.run([spec.name, spec.type, spec.value, spec.units, spec.physical_interpretation, spec.justification]);
        });
        stmt.free();
      }

      // Insert variables
      if (data.variables?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO variables (name, description, order_index, latency_spec_id, tolerance_spec_id) VALUES (?, ?, ?, ?, ?)');
        data.variables.forEach(variable => {
          stmt.run([variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null]);
        });
        stmt.free();
      }

      // Insert components
      if (data.components?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO components (name, description, order_index) VALUES (?, ?, ?)');
        data.components.forEach(component => {
          stmt.run([component.name, component.description, component.order_index]);
        });
        stmt.free();
      }

      // Insert modes
      if (data.modes?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO modes (name, description, order_index) VALUES (?, ?, ?)');
        data.modes.forEach(mode => {
          stmt.run([mode.name, mode.description, mode.order_index]);
        });
        stmt.free();
      }

      // Insert mode-component relationships
      if (data.mode_components?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO mode_components (mode_id, component_id) VALUES (?, ?)');
        data.mode_components.forEach(mc => {
          stmt.run([mc.mode_id, mc.component_id]);
        });
        stmt.free();
      }

      // Insert requirements
      if (data.requirements?.length > 0) {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO requirements (function_id, variable_id, component_id, mode_id, parent_id, behavior, condition, justification, level, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        data.requirements.forEach(req => {
          stmt.run([
            req.function_id,
            req.variable_id,
            req.component_id,
            req.mode_id,
            req.parent_id || null,
            req.behavior,
            req.condition || null,
            req.justification || null,
            req.level,
            req.order_index
          ]);
        });
        stmt.free();
      }

      return true;
    } catch (error) {
      console.error('Error inserting initial data:', error);
      return false;
    }
  }

  clearAllData(): boolean {
    if (!this.db) return false;

    try {
      this.db.exec(`
        DELETE FROM requirements;
        DELETE FROM mode_components;
        DELETE FROM variables;
        DELETE FROM components;
        DELETE FROM modes;
        DELETE FROM functions;
        DELETE FROM tolerance_specifications;
        DELETE FROM latency_specifications;
        
        -- Reset auto-increment counters
        DELETE FROM sqlite_sequence WHERE name IN (
          'requirements', 'variables', 'components', 'modes', 
          'functions', 'tolerance_specifications', 'latency_specifications'
        );
      `);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  dropTables(): boolean {
    if (!this.db) return false;

    try {
      this.db.exec(`
        DROP TABLE IF EXISTS requirements;
        DROP TABLE IF EXISTS mode_components;
        DROP TABLE IF EXISTS variables;
        DROP TABLE IF EXISTS components;
        DROP TABLE IF EXISTS modes;
        DROP TABLE IF EXISTS functions;
        DROP TABLE IF EXISTS tolerance_specifications;
        DROP TABLE IF EXISTS latency_specifications;
      `);
      return true;
    } catch (error) {
      console.error('Error dropping tables:', error);
      return false;
    }
  }

  getTableInfo(tableName: string): any[] {
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return [];
    }
  }

  getRowCount(tableName: string): number {
    if (!this.db) return 0;

    try {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
      stmt.step();
      const count = stmt.getAsObject()['count'] as number;
      stmt.free();
      return count;
    } catch (error) {
      console.error(`Error getting row count for ${tableName}:`, error);
      return 0;
    }
  }
}
