/**
 * Version Management
 * Centralized version configuration for the entire application
 */

// Application version configuration
const AppVersion = {
  // Main application version
  app: '0.2.2',
  
  // Project export/import format version
  project: '2.0',
  
  // Storage format version (for localStorage compatibility)
  storage: '4.0',
  
  // Cache busting version for development (increment when files change)
  cache: 10,
  
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
  
  // Get storage version
  getStorageVersion() {
    return this.storage;
  }
};

// Expose to window for global access
window.AppVersion = AppVersion;

console.log(`✅ Version module loaded - App v${AppVersion.app}`);
