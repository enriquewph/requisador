-- Requisador de Requisitos v1.0.0
-- SQLite Database Schema
-- Generated on 2025-07-09

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Functions table
CREATE TABLE functions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_functions_name ON functions(name);

-- Variables table
CREATE TABLE variables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variables_name ON variables(name);

-- Components table
CREATE TABLE components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_components_name ON components(name);

-- Modes table
CREATE TABLE modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modes_name ON modes(name);

-- Mode-Component associations (many-to-many)
CREATE TABLE mode_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_mode_components_unique ON mode_components(mode_id, component_id);
CREATE INDEX idx_mode_components_mode ON mode_components(mode_id);
CREATE INDEX idx_mode_components_component ON mode_components(component_id);

-- Requirements table (main entity)
CREATE TABLE requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  function_id INTEGER NOT NULL,
  variable_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  mode_id INTEGER NOT NULL,
  parent_id INTEGER NULL,
  behavior TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE RESTRICT,
  FOREIGN KEY (variable_id) REFERENCES variables(id) ON DELETE RESTRICT,
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE RESTRICT,
  FOREIGN KEY (mode_id) REFERENCES modes(id) ON DELETE RESTRICT,
  FOREIGN KEY (parent_id) REFERENCES requirements(id) ON DELETE CASCADE
);

CREATE INDEX idx_requirements_function ON requirements(function_id);
CREATE INDEX idx_requirements_variable ON requirements(variable_id);
CREATE INDEX idx_requirements_component ON requirements(component_id);
CREATE INDEX idx_requirements_mode ON requirements(mode_id);
CREATE INDEX idx_requirements_parent ON requirements(parent_id);
CREATE INDEX idx_requirements_level ON requirements(level);
CREATE INDEX idx_requirements_order ON requirements(order_index);

-- Database metadata
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial metadata
INSERT INTO metadata (key, value) VALUES 
  ('schema_version', '1.0'),
  ('app_version', '1.0.0'),
  ('created_date', datetime('now')),
  ('migration_source', 'fresh_install');

-- Example data (optional, for testing)
-- Uncomment the following lines for sample data

/*
-- Sample functions
INSERT INTO functions (name, description) VALUES 
  ('Navegación', 'Funciones relacionadas con navegación del sistema'),
  ('Comunicación', 'Funciones de comunicación y transmisión'),
  ('Control', 'Funciones de control y regulación');

-- Sample variables
INSERT INTO variables (name, description) VALUES 
  ('Velocidad', 'Velocidad del sistema'),
  ('Posición', 'Posición geográfica'),
  ('Temperatura', 'Temperatura operacional');

-- Sample components
INSERT INTO components (name, description) VALUES 
  ('HMI', 'Interfaz Humano-Máquina'),
  ('ECI', 'Equipamiento de Control Integrado');

-- Sample modes
INSERT INTO modes (name, description) VALUES 
  ('Normal', 'Modo de operación normal'),
  ('Emergencia', 'Modo de emergencia'),
  ('Mantenimiento', 'Modo de mantenimiento');

-- Sample mode-component associations
INSERT INTO mode_components (mode_id, component_id) VALUES 
  (1, 1), (1, 2),  -- Normal mode: HMI + ECI
  (2, 1), (2, 2),  -- Emergency mode: HMI + ECI
  (3, 1);          -- Maintenance mode: HMI only

-- Sample requirements
INSERT INTO requirements (function_id, variable_id, component_id, mode_id, behavior, level, order_index) VALUES 
  (1, 1, 1, 1, 'El sistema deberá controlar la velocidad mediante la interfaz HMI', 1, 1),
  (2, 2, 2, 1, 'El ECI deberá transmitir la posición cada 5 segundos', 1, 2);
*/
