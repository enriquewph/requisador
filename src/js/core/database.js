/**
 * Database Schema and Management for SQLite
 * Version 1.0.0 - Major architectural change from localStorage to SQLite
 */

import { AppVersion } from './version.js';

/**
 * SQLite Database Schema for Requisador v1.0.0
 * 
 * This represents the new normalized database structure that will replace
 * the current localStorage-based system.
 */
export const DatabaseSchema = {
  version: AppVersion.getDatabaseVersion(),
  
  // Table definitions
  tables: {
    // Functions table
    functions: {
      name: 'functions',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL UNIQUE',
        description: 'TEXT',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      indexes: ['CREATE INDEX idx_functions_name ON functions(name)']
    },

    // Variables table
    variables: {
      name: 'variables',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL UNIQUE',
        description: 'TEXT',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      indexes: ['CREATE INDEX idx_variables_name ON variables(name)']
    },

    // Components table
    components: {
      name: 'components',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL UNIQUE',
        description: 'TEXT',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      indexes: ['CREATE INDEX idx_components_name ON components(name)']
    },

    // Modes table
    modes: {
      name: 'modes',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL UNIQUE',
        description: 'TEXT',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      indexes: ['CREATE INDEX idx_modes_name ON modes(name)']
    },

    // Mode-Component associations (many-to-many)
    mode_components: {
      name: 'mode_components',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        mode_id: 'INTEGER NOT NULL',
        component_id: 'INTEGER NOT NULL',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE CASCADE',
        'FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE'
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_mode_components_unique ON mode_components(mode_id, component_id)',
        'CREATE INDEX idx_mode_components_mode ON mode_components(mode_id)',
        'CREATE INDEX idx_mode_components_component ON mode_components(component_id)'
      ]
    },

    // Requirements table (main entity)
    requirements: {
      name: 'requirements',
      columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        function_id: 'INTEGER NOT NULL',
        variable_id: 'INTEGER NOT NULL',
        component_id: 'INTEGER NOT NULL',
        mode_id: 'INTEGER NOT NULL',
        parent_id: 'INTEGER NULL', // Self-referencing for hierarchical requirements
        behavior: 'TEXT NOT NULL',
        level: 'INTEGER NOT NULL DEFAULT 1', // 1 for top-level, 2 for sub-requirements
        order_index: 'INTEGER NOT NULL DEFAULT 0', // For ordering within same parent
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE RESTRICT',
        'FOREIGN KEY (variable_id) REFERENCES variables(id) ON DELETE RESTRICT',
        'FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE RESTRICT',
        'FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE RESTRICT',
        'FOREIGN KEY (parent_id) REFERENCES requirements(id) ON DELETE CASCADE'
      ],
      indexes: [
        'CREATE INDEX idx_requirements_function ON requirements(function_id)',
        'CREATE INDEX idx_requirements_variable ON requirements(variable_id)',
        'CREATE INDEX idx_requirements_component ON requirements(component_id)',
        'CREATE INDEX idx_requirements_mode ON requirements(mode_id)',
        'CREATE INDEX idx_requirements_parent ON requirements(parent_id)',
        'CREATE INDEX idx_requirements_level ON requirements(level)',
        'CREATE INDEX idx_requirements_order ON requirements(order_index)'
      ]
    },

    // Database metadata
    metadata: {
      name: 'metadata',
      columns: {
        key: 'TEXT PRIMARY KEY',
        value: 'TEXT NOT NULL',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      }
    }
  },

  // Initial data for metadata
  initialData: {
    metadata: [
      { key: 'schema_version', value: AppVersion.getDatabaseVersion() },
      { key: 'app_version', value: AppVersion.app },
      { key: 'created_date', value: new Date().toISOString() },
      { key: 'migration_source', value: 'localStorage_v0.2.2' }
    ]
  },

  // Generate CREATE TABLE SQL
  getCreateTableSQL(tableName) {
    const table = this.tables[tableName];
    if (!table) throw new Error(`Table ${tableName} not found in schema`);

    const columns = Object.entries(table.columns)
      .map(([name, definition]) => `  ${name} ${definition}`)
      .join(',\n');

    const foreignKeys = table.foreignKeys 
      ? ',\n  ' + table.foreignKeys.join(',\n  ')
      : '';

    return `CREATE TABLE ${table.name} (\n${columns}${foreignKeys}\n);`;
  },

  // Generate all DDL statements
  generateDDL() {
    const statements = [];
    
    // Create tables
    Object.keys(this.tables).forEach(tableName => {
      statements.push(this.getCreateTableSQL(tableName));
      
      // Add indexes
      const table = this.tables[tableName];
      if (table.indexes) {
        statements.push(...table.indexes);
      }
    });

    return statements;
  }
};

/**
 * Migration utility for moving from localStorage to SQLite
 * This will be used to migrate existing data when version 1.0.0 is deployed
 */
export class DataMigration {
  
  /**
   * Convert localStorage data to SQLite-compatible format
   * @param {Object} localStorageData - Current localStorage data structure
   * @returns {Object} - Data ready for SQLite insertion
   */
  static convertFromLocalStorage(localStorageData) {
    const migration = {
      functions: [],
      variables: [],
      components: [],
      modes: [],
      mode_components: [],
      requirements: []
    };

    // Extract unique functions
    if (localStorageData.availableFunctions) {
      migration.functions = localStorageData.availableFunctions.map((name, index) => ({
        id: index + 1,
        name: name,
        description: null
      }));
    }

    // Extract unique variables
    if (localStorageData.availableVariables) {
      migration.variables = localStorageData.availableVariables.map((name, index) => ({
        id: index + 1,
        name: name,
        description: null
      }));
    }

    // Extract unique components
    if (localStorageData.availableComponents) {
      migration.components = localStorageData.availableComponents.map((name, index) => ({
        id: index + 1,
        name: name,
        description: null
      }));
    }

    // Extract modes and their component associations
    if (localStorageData.allModes) {
      migration.modes = localStorageData.allModes.map((name, index) => ({
        id: index + 1,
        name: name,
        description: null
      }));

      // Build mode-component associations
      if (localStorageData.modeComponentAssociations) {
        localStorageData.modeComponentAssociations.forEach(association => {
          const modeId = migration.modes.find(m => m.name === association.mode)?.id;
          association.components.forEach(componentName => {
            const componentId = migration.components.find(c => c.name === componentName)?.id;
            if (modeId && componentId) {
              migration.mode_components.push({
                mode_id: modeId,
                component_id: componentId
              });
            }
          });
        });
      }
    }

    // Convert requirements
    if (localStorageData.requirements) {
      migration.requirements = localStorageData.requirements.map((req, index) => {
        const functionId = migration.functions.find(f => f.name === req.function)?.id;
        const variableId = migration.variables.find(v => v.name === req.variable)?.id;
        const componentId = migration.components.find(c => c.name === req.component)?.id;
        const modeId = migration.modes.find(m => m.name === req.mode)?.id;

        return {
          id: index + 1,
          function_id: functionId,
          variable_id: variableId,
          component_id: componentId,
          mode_id: modeId,
          parent_id: req.parentId || null,
          behavior: req.behavior,
          level: req.level || 1,
          order_index: index
        };
      });
    }

    return migration;
  }

  /**
   * Generate SQL INSERT statements for migrated data
   * @param {Object} migrationData - Data from convertFromLocalStorage
   * @returns {Array} - Array of SQL INSERT statements
   */
  static generateInsertSQL(migrationData) {
    const statements = [];

    // Insert functions
    migrationData.functions.forEach(func => {
      statements.push(
        `INSERT INTO functions (name, description) VALUES ('${func.name}', ${func.description ? `'${func.description}'` : 'NULL'});`
      );
    });

    // Insert variables
    migrationData.variables.forEach(variable => {
      statements.push(
        `INSERT INTO variables (name, description) VALUES ('${variable.name}', ${variable.description ? `'${variable.description}'` : 'NULL'});`
      );
    });

    // Insert components
    migrationData.components.forEach(component => {
      statements.push(
        `INSERT INTO components (name, description) VALUES ('${component.name}', ${component.description ? `'${component.description}'` : 'NULL'});`
      );
    });

    // Insert modes
    migrationData.modes.forEach(mode => {
      statements.push(
        `INSERT INTO modes (name, description) VALUES ('${mode.name}', ${mode.description ? `'${mode.description}'` : 'NULL'});`
      );
    });

    // Insert mode-component associations
    migrationData.mode_components.forEach(assoc => {
      statements.push(
        `INSERT INTO mode_components (mode_id, component_id) VALUES (${assoc.mode_id}, ${assoc.component_id});`
      );
    });

    // Insert requirements
    migrationData.requirements.forEach(req => {
      statements.push(
        `INSERT INTO requirements (function_id, variable_id, component_id, mode_id, parent_id, behavior, level, order_index) VALUES (${req.function_id}, ${req.variable_id}, ${req.component_id}, ${req.mode_id}, ${req.parent_id || 'NULL'}, '${req.behavior}', ${req.level}, ${req.order_index});`
      );
    });

    return statements;
  }
}

// Default export
export default DatabaseSchema;
