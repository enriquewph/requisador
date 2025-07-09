@echo off
REM Version Update Script for Requisador de Requisitos
REM Usage: update-version.bat [new_version] [options]

setlocal enabledelayedexpansion

set "VERSION_FILE=src\js\core\version.js"

if "%1"=="" (
    echo 🔍 Current versions:
    
    REM Extract current versions (simplified for Windows)
    for /f "tokens=2 delims='" %%i in ('findstr "app:" %VERSION_FILE%') do set "current_app=%%i"
    for /f "tokens=2 delims='" %%i in ('findstr "project:" %VERSION_FILE%') do set "current_project=%%i"
    for /f "tokens=2 delims='" %%i in ('findstr "storage:" %VERSION_FILE%') do set "current_storage=%%i"
    for /f "tokens=2" %%i in ('findstr "cache:" %VERSION_FILE%') do set "current_cache=%%i"
    
    echo    App: !current_app!
    echo    Project: !current_project!
    echo    Storage: !current_storage!
    echo    Cache: !current_cache!
    echo.
    echo Usage: %0 [new_app_version] [options]
    echo.
    echo Options:
    echo   --cache     Increment cache version only
    echo   --project   Update project version
    echo   --storage   Update storage version
    echo.
    echo Examples:
    echo   %0 0.2.0              # Update app version to 0.2.0
    echo   %0 --cache            # Increment cache version
    echo   %0 0.2.0 --cache      # Update app version and increment cache
    goto :end
)

if not exist "%VERSION_FILE%" (
    echo ❌ Version file not found: %VERSION_FILE%
    goto :end
)

:parse_args
if "%1"=="" goto :update_build_date

if "%1"=="--cache" (
    call :increment_cache
    shift
    goto :parse_args
)

if "%1"=="--project" (
    if "%2"=="" (
        echo ❌ --project requires a version number
        goto :end
    )
    call :update_project_version "%2"
    shift
    shift
    goto :parse_args
)

if "%1"=="--storage" (
    if "%2"=="" (
        echo ❌ --storage requires a version number
        goto :end
    )
    call :update_storage_version "%2"
    shift
    shift
    goto :parse_args
)

if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

REM Assume it's an app version
call :update_app_version "%1"
shift
goto :parse_args

:increment_cache
for /f "tokens=2" %%i in ('findstr "cache:" %VERSION_FILE%') do set "current_cache=%%i"
set /a "new_cache=!current_cache! + 1"
powershell -Command "(Get-Content '%VERSION_FILE%') -replace 'cache: !current_cache!', 'cache: !new_cache!' | Set-Content '%VERSION_FILE%'"
echo 📦 Cache version incremented: !current_cache! → !new_cache!
goto :eof

:update_app_version
set "new_version=%~1"
powershell -Command "(Get-Content '%VERSION_FILE%') -replace \"app: '[^']*'\", \"app: '!new_version!'\" | Set-Content '%VERSION_FILE%'"
echo 🚀 App version updated: !new_version!
goto :eof

:update_project_version
set "new_version=%~1"
powershell -Command "(Get-Content '%VERSION_FILE%') -replace \"project: '[^']*'\", \"project: '!new_version!'\" | Set-Content '%VERSION_FILE%'"
echo 📋 Project version updated: !new_version!
goto :eof

:update_storage_version
set "new_version=%~1"
powershell -Command "(Get-Content '%VERSION_FILE%') -replace \"storage: '[^']*'\", \"storage: '!new_version!'\" | Set-Content '%VERSION_FILE%'"
echo 💾 Storage version updated: !new_version!
goto :eof

:update_build_date
echo.
echo ✅ Version file updated successfully!
echo 📄 File: %VERSION_FILE%
echo.
echo 🔄 Updated versions:
findstr /C:"app:" /C:"project:" /C:"storage:" /C:"cache:" "%VERSION_FILE%"

:show_help
goto :end

:end
endlocal
