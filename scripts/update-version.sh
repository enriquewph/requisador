#!/bin/bash

# Version Update Script for Requisador de Requisitos
# Usage: ./update-version.sh [new_version]

if [ $# -eq 0 ]; then
    echo "🔍 Current versions:"
    echo "   App: $(grep -o "app: '[^']*'" src/js/core/version.js | cut -d "'" -f 2)"
    echo "   Project: $(grep -o "project: '[^']*'" src/js/core/version.js | cut -d "'" -f 2)"
    echo "   Storage: $(grep -o "storage: '[^']*'" src/js/core/version.js | cut -d "'" -f 2)"
    echo "   Cache: $(grep -o "cache: [0-9]*" src/js/core/version.js | cut -d " " -f 2)"
    echo ""
    echo "Usage: $0 [new_app_version] [options]"
    echo ""
    echo "Options:"
    echo "  --cache     Increment cache version only"
    echo "  --project   Update project version"
    echo "  --storage   Update storage version"
    echo ""
    echo "Examples:"
    echo "  $0 0.2.0              # Update app version to 0.2.0"
    echo "  $0 --cache            # Increment cache version"
    echo "  $0 0.2.0 --cache      # Update app version and increment cache"
    exit 1
fi

VERSION_FILE="src/js/core/version.js"

if [ ! -f "$VERSION_FILE" ]; then
    echo "❌ Version file not found: $VERSION_FILE"
    exit 1
fi

# Function to increment cache version
increment_cache() {
    local current_cache=$(grep -o "cache: [0-9]*" "$VERSION_FILE" | cut -d " " -f 2)
    local new_cache=$((current_cache + 1))
    sed -i "s/cache: $current_cache/cache: $new_cache/" "$VERSION_FILE"
    echo "📦 Cache version incremented: $current_cache → $new_cache"
}

# Function to update app version
update_app_version() {
    local new_version="$1"
    sed -i "s/app: '[^']*'/app: '$new_version'/" "$VERSION_FILE"
    echo "🚀 App version updated: $new_version"
}

# Function to update project version
update_project_version() {
    local new_version="$1"
    sed -i "s/project: '[^']*'/project: '$new_version'/" "$VERSION_FILE"
    echo "📋 Project version updated: $new_version"
}

# Function to update storage version
update_storage_version() {
    local new_version="$1"
    sed -i "s/storage: '[^']*'/storage: '$new_version'/" "$VERSION_FILE"
    echo "💾 Storage version updated: $new_version"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --cache)
            increment_cache
            shift
            ;;
        --project)
            if [[ -n $2 && $2 != --* ]]; then
                update_project_version "$2"
                shift 2
            else
                echo "❌ --project requires a version number"
                exit 1
            fi
            ;;
        --storage)
            if [[ -n $2 && $2 != --* ]]; then
                update_storage_version "$2"
                shift 2
            else
                echo "❌ --storage requires a version number"
                exit 1
            fi
            ;;
        --help|-h)
            echo "Version management help displayed above"
            exit 0
            ;;
        *)
            # Assume it's a version number for the app
            if [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                update_app_version "$1"
            else
                echo "❌ Invalid version format: $1"
                echo "   Expected format: X.Y.Z (e.g., 0.2.0)"
                exit 1
            fi
            shift
            ;;
    esac
done

# Update build date
sed -i "s/date: new Date().toISOString().split('T')\[0\]/date: new Date().toISOString().split('T')[0]/" "$VERSION_FILE"

echo ""
echo "✅ Version file updated successfully!"
echo "📄 File: $VERSION_FILE"
echo ""
echo "🔄 Current versions after update:"
grep -A 10 "const AppVersion" "$VERSION_FILE" | grep -E "(app|project|storage|cache):" | sed 's/^[[:space:]]*/   /'
