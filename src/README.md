# 📁 Source Directory

This directory contains all the source files for the Requisador de Requisitos application.

## 🗂️ Structure

```
src/
├── index.html                      # Main modular application entry point
├── index-no-cors.html             # CORS-free version for direct file access
├── index-original-backup.html     # Backup of the original monolithic version
├── robots.txt                     # Search engine crawler instructions
│
├── assets/                        # Static assets
│   └── favicon.svg               # Application icon
│
├── components/                    # Reusable HTML components
│   ├── header.html               # Navigation header
│   ├── footer.html               # Page footer
│   └── about-modal.html          # About dialog modal
│
├── pages/                         # Tab content pages
│   ├── config.html               # System configuration tab
│   ├── create.html               # Requirement creation tab
│   ├── list.html                 # Requirements list tab
│   ├── tree.html                 # Requirements tree view tab
│   └── guidelines.html           # Guidelines and help tab
│
├── js/                           # JavaScript modules
│   ├── core/                     # Core application logic
│   │   ├── app.js               # Main application controller
│   │   └── config.js            # Configuration management
│   │
│   ├── modules/                  # Feature-specific modules
│   │   ├── requirements.js      # Requirements CRUD operations
│   │   └── export.js            # Export/import functionality
│   │
│   └── utils/                    # Utility functions
│       ├── page-loader.js       # Dynamic component loading
│       └── init.js              # Application initialization
│
└── css/                          # Stylesheets
    └── styles.css               # Custom CSS styles
```

## 🚀 Deployment

This directory is deployment-ready and contains all the files needed to run the application.

For local development, run the server scripts from the parent directory:
- **Windows**: `start-server.bat`
- **Linux/Mac**: `./start-server.sh`

For production deployment, copy the contents of this `src/` directory to your web server's document root.

## 📝 Notes

- All paths are relative and work correctly when the entire `src/` directory is deployed together
- The application supports both server-based deployment (`index.html`) and direct file access (`index-no-cors.html`)
- All JavaScript modules are properly namespaced to avoid conflicts
- The modular structure allows for easy maintenance and feature additions
