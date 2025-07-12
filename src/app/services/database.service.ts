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
  private readonly STORAGE_KEY = 'requisador_database';

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
      
      // Try to load from localStorage first
      const savedData = this.loadFromLocalStorage();
      if (savedData) {
        console.log('Loading database from localStorage...');
        this.db = new SQL.Database(savedData);
        this.updateRepositoryDatabases();
        this.isInitialized.set(true);
        console.log('Database loaded from localStorage successfully');
        return;
      }

      // If no saved data, create new database and load initial data
      console.log('No saved database found, creating new database...');
      this.db = new SQL.Database();
      
      // Update all repositories with the database instance
      this.updateRepositoryDatabases();
      
      // Create tables and load initial data
      if (this.schema.createTables()) {
        await this.schema.loadInitialData();
        this.saveToLocalStorage(); // Save after loading initial data
        this.isInitialized.set(true);
        console.log('Database initialized with initial data and saved to localStorage');
      } else {
        throw new Error('Failed to create database tables');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private updateRepositoryDatabases(): void {
    const saveCallback = () => this.saveToLocalStorage();
    
    this.functions = new FunctionsRepository(this.db, saveCallback);
    this.variables = new VariablesRepository(this.db, saveCallback);
    this.components = new ComponentsRepository(this.db, saveCallback);
    this.modes = new ModesRepository(this.db, saveCallback);
    this.latencySpecifications = new LatencySpecificationsRepository(this.db, saveCallback);
    this.toleranceSpecifications = new ToleranceSpecificationsRepository(this.db, saveCallback);
    this.requirements = new RequirementsRepository(this.db, saveCallback);
    this.schema = new SchemaManager(this.db, saveCallback);
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
      this.saveToLocalStorage(); // Save after reset
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
      this.saveToLocalStorage(); // Save after import
      this.isInitialized.set(true);
      console.log('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import database:', error);
      return false;
    }
  }

  // LocalStorage management methods
  private saveToLocalStorage(): void {
    try {
      if (!this.db) return;
      
      const data = this.db.export();
      const base64Data = this.arrayBufferToBase64(data);
      localStorage.setItem(this.STORAGE_KEY, base64Data);
      console.log('Database saved to localStorage');
    } catch (error) {
      console.error('Failed to save database to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): Uint8Array | null {
    try {
      const base64Data = localStorage.getItem(this.STORAGE_KEY);
      if (!base64Data) return null;
      
      return this.base64ToArrayBuffer(base64Data);
    } catch (error) {
      console.error('Failed to load database from localStorage:', error);
      return null;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    const binary = Array.from(buffer).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  // Public method to manually save database (for use by repositories)
  saveDatabase(): void {
    this.saveToLocalStorage();
  }

  // Method to clear localStorage
  clearStoredDatabase(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Stored database cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear stored database:', error);
    }
  }
}
