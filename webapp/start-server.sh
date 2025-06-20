#!/bin/bash

# Facebook Ads Intelligence Dashboard - Server Launcher
# Automatically detects and runs available server option

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PORT=8080
PYTHON_PORT=8000

# Function to print colored output
print_color() {
    printf "${2}${1}${NC}\n"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1 || netstat -an | grep -q ":$1 "
}

# Function to find available port
find_available_port() {
    local port=$1
    while port_in_use $port; do
        port=$((port + 1))
    done
    echo $port
}

# Banner
print_color "
🧠 Facebook Ads Intelligence Dashboard
=====================================
" "$BLUE"

# Detect available runtimes
AVAILABLE_SERVERS=()

if command_exists node; then
    AVAILABLE_SERVERS+=("node")
    NODE_VERSION=$(node --version)
fi

if command_exists python3; then
    AVAILABLE_SERVERS+=("python")
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
elif command_exists python; then
    AVAILABLE_SERVERS+=("python")
    PYTHON_VERSION=$(python --version | cut -d' ' -f2)
fi

if command_exists docker; then
    AVAILABLE_SERVERS+=("docker")
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
fi

# Check if any server is available
if [ ${#AVAILABLE_SERVERS[@]} -eq 0 ]; then
    print_color "❌ No server runtime found!" "$RED"
    print_color "Please install one of the following:" "$YELLOW"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - Python 3: https://www.python.org/"
    echo "  - Docker: https://www.docker.com/"
    exit 1
fi

# Display available options
print_color "Available server options:" "$GREEN"
echo

INDEX=1
for server in "${AVAILABLE_SERVERS[@]}"; do
    case $server in
        "node")
            echo "  $INDEX) Node.js server (v$NODE_VERSION)"
            ;;
        "python")
            echo "  $INDEX) Python server (v$PYTHON_VERSION)"
            ;;
        "docker")
            echo "  $INDEX) Docker container (v$DOCKER_VERSION)"
            ;;
    esac
    INDEX=$((INDEX + 1))
done

echo "  q) Quit"
echo

# Get user choice
if [ ${#AVAILABLE_SERVERS[@]} -eq 1 ]; then
    # Auto-select if only one option
    CHOICE=1
    print_color "Auto-selecting ${AVAILABLE_SERVERS[0]} server..." "$YELLOW"
else
    read -p "Select server option (1-${#AVAILABLE_SERVERS[@]}): " CHOICE
fi

# Handle quit
if [ "$CHOICE" = "q" ] || [ "$CHOICE" = "Q" ]; then
    print_color "👋 Goodbye!" "$BLUE"
    exit 0
fi

# Validate choice
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#AVAILABLE_SERVERS[@]} ]; then
    print_color "❌ Invalid choice!" "$RED"
    exit 1
fi

# Get selected server
SELECTED_SERVER=${AVAILABLE_SERVERS[$((CHOICE - 1))]}

# Change to webapp directory
cd "$(dirname "$0")"

# Run selected server
case $SELECTED_SERVER in
    "node")
        PORT=$(find_available_port $DEFAULT_PORT)
        if [ "$PORT" != "$DEFAULT_PORT" ]; then
            print_color "⚠️  Port $DEFAULT_PORT in use, using port $PORT instead" "$YELLOW"
        fi
        print_color "🚀 Starting Node.js server on port $PORT..." "$GREEN"
        PORT=$PORT node server.js
        ;;
        
    "python")
        PORT=$(find_available_port $PYTHON_PORT)
        if [ "$PORT" != "$PYTHON_PORT" ]; then
            print_color "⚠️  Port $PYTHON_PORT in use, using port $PORT instead" "$YELLOW"
        fi
        print_color "🚀 Starting Python server on port $PORT..." "$GREEN"
        python3 server.py --port $PORT 2>/dev/null || python server.py --port $PORT
        ;;
        
    "docker")
        print_color "🚀 Starting Docker container..." "$GREEN"
        
        # Check if container is already running
        if docker ps | grep -q facebook-ads-intelligence; then
            print_color "⚠️  Container already running. Stopping it first..." "$YELLOW"
            docker-compose down
        fi
        
        # Start container
        docker-compose up --build
        ;;
esac