#!/bin/bash

# Generate package-lock.json for the Requisador project
# This creates a lock file based on the existing package.json

echo "🔒 Generating package-lock.json for Requisador de Requisitos..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found! Make sure you're in the project root directory."
    exit 1
fi

# Check if package-lock.json already exists
if [ -f "package-lock.json" ]; then
    echo "ℹ️ package-lock.json already exists"
    echo "🔄 Updating existing lock file..."
    npm install --package-lock-only
else
    echo "📦 Creating new package-lock.json..."
    npm install --package-lock-only
fi

# Verify the lock file was created
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json generated successfully!"
    echo "📊 Lock file details:"
    ls -la package-lock.json
    
    # Show some stats
    packages=$(grep -c '"resolved":' package-lock.json || echo "0")
    echo "📦 Locked $packages package versions"
    
    echo ""
    echo "🚀 Benefits:"
    echo "  - Faster npm installs with caching"
    echo "  - Consistent dependency versions across environments"
    echo "  - Better CI/CD performance"
    echo ""
    echo "💡 Tip: Commit this file to your repository for better consistency"
else
    echo "❌ Failed to generate package-lock.json"
    echo "🔍 Troubleshooting:"
    echo "  - Check if npm is installed and working"
    echo "  - Verify package.json syntax"
    echo "  - Try running: npm install"
    exit 1
fi
