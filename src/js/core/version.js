/**
 * Version Management
 * Centralized version configuration for the entire application
 */

// Application version configuration
const AppVersion = {
  // Main application version
  app: '1.0.0',
  
  // Project export/import format version
  project: '3.0',
  
  // Database schema version (for SQLite migration)
  database: '1.0',
  
  // Cache busting version for development (increment when files change)
  cache: 11,
  
  // Build information
  build: {
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    timestamp: Date.now()
  },
  
  // Get full version string
  getFullVersion() {
    return `${this.app} (build ${this.build.date})`;
  },
  
  // Get cache buster parameter
  getCacheBuster() {
    return `?v=${this.cache}`;
  },
  
  // Get project version for exports
  getProjectVersion() {
    return this.project;
  },
  
  // Get database schema version
  getDatabaseVersion() {
    return this.database;
  },
  
  // Get storage version
  getStorageVersion() {
    return this.storage;
  }
};

// Expose to window for global access
window.AppVersion = AppVersion;

console.log(`✅ Version module loaded - App v${AppVersion.app}`);
