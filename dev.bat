@echo off
REM =============================================================================
REM Requisador de Requisitos - Development Environment Manager
REM =============================================================================
REM Usage: dev.bat [command]
REM Commands:
REM   setup     - Full setup (install deps, build CSS, update browserslist)
REM   start     - Start development server
REM   build     - Build CSS once
REM   watch     - Build CSS in watch mode
REM   update    - Update browserslist database
REM   clean     - Stop and remove all containers/volumes
REM   shell     - Open shell in container
REM   logs      - Show container logs
REM   help      - Show this help
REM =============================================================================

set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

REM Check Docker availability
call :check_docker
if errorlevel 1 exit /b 1

if "%COMMAND%"=="setup" goto :setup
if "%COMMAND%"=="start" goto :start
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="watch" goto :watch
if "%COMMAND%"=="update" goto :update
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="shell" goto :shell
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="lint" goto :lint
if "%COMMAND%"=="lint-fix" goto :lint_fix
if "%COMMAND%"=="format" goto :format
if "%COMMAND%"=="format-check" goto :format_check
if "%COMMAND%"=="validate" goto :validate
if "%COMMAND%"=="help" goto :help
goto :help

:setup
echo 🚀 Setting up Requisador de Requisitos Development Environment
echo.
echo 📦 Installing dependencies...
docker-compose --profile tools run --rm npm
echo.
echo 🔄 Updating browserslist database...
docker-compose run --rm requisador-dev npx update-browserslist-db@latest
echo.
echo 🎨 Building TailwindCSS...
docker-compose run --rm requisador-dev npm run build:css:once
echo.
echo ✅ Setup completed! Use 'dev.bat start' to run the development server.
goto :end

:start
echo 🐳 Starting development server at http://localhost:8000
echo 🔧 Press Ctrl+C to stop
echo.
docker-compose up
goto :end

:build
echo 🎨 Building TailwindCSS...
docker-compose run --rm requisador-dev npm run build:css:once
goto :end

:watch
echo 👀 Starting TailwindCSS watch mode (press Ctrl+C to stop)...
docker-compose run --rm requisador-dev npm run build:css:watch
goto :end

:update
echo 🔄 Updating browserslist database...
docker-compose run --rm requisador-dev npx update-browserslist-db@latest
goto :end

:clean
echo 🧹 Cleaning up Docker containers and volumes...
docker-compose down -v
docker system prune -f
echo ✅ Cleanup completed
goto :end

:shell
echo 🐚 Opening shell in container...
docker-compose exec requisador-dev sh
goto :end

:logs
echo 📋 Showing container logs (press Ctrl+C to exit)...
docker-compose logs -f
goto :end

:lint
echo 🔍 Running ESLint...
docker-compose run --rm requisador-dev npm run lint
goto :end

:lint_fix
echo 🔧 Running ESLint with auto-fix...
docker-compose run --rm requisador-dev npm run lint:fix
goto :end

:format
echo ✨ Formatting code with Prettier...
docker-compose run --rm requisador-dev npm run format
goto :end

:format_check
echo 🔍 Checking code format with Prettier...
docker-compose run --rm requisador-dev npm run format:check
goto :end

:validate
echo ✅ Validating HTML...
docker-compose run --rm requisador-dev npm run validate
goto :end

:help
echo.
echo 🚀 Requisador de Requisitos - Development Environment Manager
echo.
echo Usage: dev.bat [command]
echo.
echo Commands:
echo   setup     - Full setup (install deps, build CSS, update browserslist)
echo   start     - Start development server at http://localhost:8000
echo   build     - Build TailwindCSS once
echo   watch     - Build TailwindCSS in watch mode
echo   update    - Update browserslist database
echo   clean     - Stop and remove all containers/volumes
echo   shell     - Open shell in container
echo   logs      - Show container logs
echo   lint      - Run ESLint code analysis
echo   lint-fix  - Run ESLint and auto-fix issues
echo   format    - Format code with Prettier
echo   format-check - Check code format without changing
echo   validate  - Validate HTML files
echo   help      - Show this help
echo.
echo Examples:
echo   dev.bat setup    # First time setup
echo   dev.bat start    # Start development server
echo   dev.bat build    # Build CSS once
echo.
goto :end

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo 📥 Download from: https://www.docker.com/products/docker-desktop
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)
exit /b 0

:end
