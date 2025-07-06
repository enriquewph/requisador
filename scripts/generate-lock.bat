@echo off
REM Generate package-lock.json for the Requisador project
REM This creates a lock file based on the existing package.json

echo 🔒 Generating package-lock.json for Requisador de Requisitos...

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found! Make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Check if package-lock.json already exists
if exist "package-lock.json" (
    echo ℹ️ package-lock.json already exists
    echo 🔄 Updating existing lock file...
) else (
    echo 📦 Creating new package-lock.json...
)

REM Generate the lock file
npm install --package-lock-only

REM Verify the lock file was created
if exist "package-lock.json" (
    echo ✅ package-lock.json generated successfully!
    echo 📊 Lock file details:
    dir package-lock.json
    
    echo.
    echo 🚀 Benefits:
    echo   - Faster npm installs with caching
    echo   - Consistent dependency versions across environments
    echo   - Better CI/CD performance
    echo.
    echo 💡 Tip: Commit this file to your repository for better consistency
) else (
    echo ❌ Failed to generate package-lock.json
    echo 🔍 Troubleshooting:
    echo   - Check if npm is installed and working
    echo   - Verify package.json syntax
    echo   - Try running: npm install
    pause
    exit /b 1
)

pause
