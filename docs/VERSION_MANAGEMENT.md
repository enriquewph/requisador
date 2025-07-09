# Version Management

This project uses a centralized version management system to ensure consistency across all files.

## Version Configuration

All versions are defined in a single file: `src/js/core/version.js`

### Version Types

- **App Version** (`app`): Main application version (semantic versioning: X.Y.Z)
- **Project Version** (`project`): Export/import format version for project files
- **Storage Version** (`storage`): localStorage format version for compatibility
- **Cache Version** (`cache`): Cache busting parameter for development

### Usage in Code

```javascript
// Access versions in JavaScript
AppVersion.app                  // "0.1.0"
AppVersion.getFullVersion()     // "0.1.0 (build 2025-01-09)"
AppVersion.getProjectVersion()  // "1.0"
AppVersion.getStorageVersion()  // "3.0"
AppVersion.getCacheBuster()     // "?v=7"
```

### Automatic Updates

The system automatically applies versions to:

- ✅ **HTML cache busting**: `styles.css?v=7`, `app.js?v=7`
- ✅ **About modal**: "Versión 0.1.0 (build 2025-01-09)"
- ✅ **Project exports**: JSON files include correct project version
- ✅ **localStorage**: Data includes storage version for compatibility
- ✅ **Console logs**: Application startup shows full version

## Updating Versions

### Manual Updates

Edit `src/js/core/version.js` directly:

```javascript
const AppVersion = {
  app: '0.2.0',        // ← Change this
  project: '1.1',      // ← Or this
  storage: '3.1',      // ← Or this
  cache: 8,            // ← Or this
  // ...
};
```

### Using Scripts

#### Unix/Linux/macOS:
```bash
# View current versions
./scripts/update-version.sh

# Update app version
./scripts/update-version.sh 0.2.0

# Increment cache only (for development)
./scripts/update-version.sh --cache

# Update multiple versions
./scripts/update-version.sh 0.2.0 --cache
```

#### Windows:
```cmd
# View current versions
scripts\update-version.bat

# Update app version
scripts\update-version.bat 0.2.0

# Increment cache only
scripts\update-version.bat --cache
```

## File Integration

### Files that use centralized versions:

- `src/index.html` - Cache busting and startup logs
- `src/js/core/config.js` - App metadata
- `src/js/core/globals.js` - Project export version
- `src/js/core/storage.js` - Storage format version
- `src/js/core/app.js` - About modal version display
- `src/js/tabs/export-tab.js` - Project export version
- `src/components/about-modal.html` - Version display element
- `package.json` - Package version (should match app version)

### Cache Busting

During development, increment the cache version to force browser refresh:

```bash
./scripts/update-version.sh --cache
```

This adds `?v=X` parameters to CSS and JS files automatically.

## Version History

Track version changes in `CHANGELOG.md` when updating the app version.

## Best Practices

1. **Semantic Versioning**: Use X.Y.Z format for app version
2. **Increment Cache**: Bump cache version during active development
3. **Project Version**: Only change when export format changes
4. **Storage Version**: Only change when localStorage format changes
5. **Sync package.json**: Keep package.json version aligned with app version
