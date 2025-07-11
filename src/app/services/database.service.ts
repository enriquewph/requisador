import { Injectable, signal } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

// Import repositories and related types
import { FunctionsRepository } from './database/functions.repository';
import { VariablesRepository } from './database/variables.repository';
import { ComponentsRepository } from './database/components.repository';
import { ModesRepository } from './database/modes.repository';
import { LatencySpecificationsRepository } from './database/latency-specifications.repository';
import { ToleranceSpecificationsRepository } from './database/tolerance-specifications.repository';
import { RequirementsRepository } from './database/requirements.repository';
import { SchemaManager } from './database/schema';

// Re-export types for backward compatibility
export type {
  Function,
  Variable,
  Component,
  Mode,
  ModeComponent,
  Requirement,
  LatencySpecification,
  ToleranceSpecification,
  InitialData,
  VariableWithSpecifications
} from './database/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: Database | null = null;
  private isInitialized = signal(false);

  // Repository instances
  public functions: FunctionsRepository;
  public variables: VariablesRepository;
  public components: ComponentsRepository;
  public modes: ModesRepository;
  public latencySpecifications: LatencySpecificationsRepository;
  public toleranceSpecifications: ToleranceSpecificationsRepository;
  public requirements: RequirementsRepository;
  public schema: SchemaManager;

  constructor() {
    // Initialize repositories with null database (will be set after DB initialization)
    this.functions = new FunctionsRepository(null);
    this.variables = new VariablesRepository(null);
    this.components = new ComponentsRepository(null);
    this.modes = new ModesRepository(null);
    this.latencySpecifications = new LatencySpecificationsRepository(null);
    this.toleranceSpecifications = new ToleranceSpecificationsRepository(null);
    this.requirements = new RequirementsRepository(null);
    this.schema = new SchemaManager(null);

    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/assets/${file}`
      });
      
      this.db = new SQL.Database();
      
      // Update all repositories with the database instance
      this.updateRepositoryDatabases();
      
      // Create tables and load initial data
      if (this.schema.createTables()) {
        await this.schema.loadInitialData();
        this.isInitialized.set(true);
        console.log('Database initialized successfully');
      } else {
        throw new Error('Failed to create database tables');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private updateRepositoryDatabases(): void {
    this.functions = new FunctionsRepository(this.db);
    this.variables = new VariablesRepository(this.db);
    this.components = new ComponentsRepository(this.db);
    this.modes = new ModesRepository(this.db);
    this.latencySpecifications = new LatencySpecificationsRepository(this.db);
    this.toleranceSpecifications = new ToleranceSpecificationsRepository(this.db);
    this.requirements = new RequirementsRepository(this.db);
    this.schema = new SchemaManager(this.db);
  }

  // Utility methods
  isReady(): boolean {
    return this.isInitialized();
  }

  getDatabase(): Database | null {
    return this.db;
  }

  async resetDatabase(): Promise<void> {
    if (this.schema.clearAllData()) {
      await this.schema.loadInitialData();
      console.log('Database reset successfully');
    }
  }

  exportDatabase(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<boolean> {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/assets/${file}`
      });
      
      this.db = new SQL.Database(data);
      this.updateRepositoryDatabases();
      this.isInitialized.set(true);
      console.log('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import database:', error);
      return false;
    }
  }
}
