#!/bin/bash
# =============================================================================
# Requisador de Requisitos - Development Environment Manager
# =============================================================================
# Usage: ./dev.sh [command]
# Commands:
#   setup     - Full setup (install deps, build CSS, update browserslist)
#   start     - Start development server
#   build     - Build CSS once
#   watch     - Build CSS in watch mode
#   update    - Update browserslist database
#   clean     - Stop and remove all containers/volumes
#   shell     - Open shell in container
#   logs      - Show container logs
#   help      - Show this help
# =============================================================================

COMMAND=${1:-help}

# Check Docker availability
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "📥 Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        echo "📥 Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

setup() {
    echo "🚀 Setting up Requisador de Requisitos Development Environment"
    echo ""
    echo "📦 Installing dependencies..."
    docker-compose --profile tools run --rm npm
    echo ""
    echo "🔄 Updating browserslist database..."
    docker-compose run --rm requisador-dev npx update-browserslist-db@latest
    echo ""
    echo "🎨 Building TailwindCSS..."
    docker-compose run --rm requisador-dev npm run build:css:once
    echo ""
    echo "✅ Setup completed! Use './dev.sh start' to run the development server."
}

start() {
    echo "🐳 Starting development server at http://localhost:8000"
    echo "🔧 Press Ctrl+C to stop"
    echo ""
    docker-compose up
}

build() {
    echo "🎨 Building TailwindCSS..."
    docker-compose run --rm requisador-dev npm run build:css:once
}

watch() {
    echo "👀 Starting TailwindCSS watch mode (press Ctrl+C to stop)..."
    docker-compose run --rm requisador-dev npm run build:css:watch
}

update() {
    echo "🔄 Updating browserslist database..."
    docker-compose run --rm requisador-dev npx update-browserslist-db@latest
}

clean() {
    echo "🧹 Cleaning up Docker containers and volumes..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup completed"
}

shell() {
    echo "🐚 Opening shell in container..."
    docker-compose exec requisador-dev sh
}

logs() {
    echo "📋 Showing container logs (press Ctrl+C to exit)..."
    docker-compose logs -f
}

lint() {
    echo "🔍 Running ESLint..."
    docker-compose run --rm requisador-dev npm run lint
}

format() {
    echo "✨ Formatting code with Prettier..."
    docker-compose run --rm requisador-dev npm run format
}

format_check() {
    echo "🔍 Checking code format with Prettier..."
    docker-compose run --rm requisador-dev npm run format:check
}

validate() {
    echo "✅ Validating HTML..."
    docker-compose run --rm requisador-dev npm run validate
}

help() {
    echo ""
    echo "🚀 Requisador de Requisitos - Development Environment Manager"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Full setup (install deps, build CSS, update browserslist)"
    echo "  start     - Start development server at http://localhost:8000"
    echo "  build     - Build TailwindCSS once"
    echo "  watch     - Build TailwindCSS in watch mode"
    echo "  update    - Update browserslist database"
    echo "  clean     - Stop and remove all containers/volumes"
    echo "  shell     - Open shell in container"
    echo "  logs      - Show container logs"
    echo "  lint      - Run ESLint code analysis"
    echo "  format    - Format code with Prettier"
    echo "  format-check - Check code format without changing"
    echo "  validate  - Validate HTML files"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup    # First time setup"
    echo "  ./dev.sh start    # Start development server"
    echo "  ./dev.sh build    # Build CSS once"
    echo ""
}

# Main execution
check_docker

case "$COMMAND" in
    setup)         setup ;;
    start)         start ;;
    build)         build ;;
    watch)         watch ;;
    update)        update ;;
    clean)         clean ;;
    shell)         shell ;;
    logs)          logs ;;
    lint)          lint ;;
    format)        format ;;
    format-check)  format_check ;;
    validate)      validate ;;
    help)          help ;;
    *)             help ;;
esac
