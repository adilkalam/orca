#!/bin/bash
# ORCA-OS Installer v4.0.0
# Orchestrated Response Coordination Architecture
# https://github.com/adilkalam/orca-os

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
ORCA_VERSION="4.0.0"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCA_ROOT="$(dirname "$SCRIPT_DIR")"

# Mode flags
UPGRADE_MODE=0
START_TIME=$(date +%s)

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --upgrade|-u)
            UPGRADE_MODE=1
            shift
            ;;
        --help|-h)
            echo "ORCA-OS Installer v${ORCA_VERSION}"
            echo ""
            echo "Usage: ./install.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --upgrade, -u    Fast upgrade for existing installations"
            echo "                   - Auto-backups without prompting"
            echo "                   - Skips unchanged dependencies"
            echo "                   - Shows what's new"
            echo "  --help, -h       Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Compute checksum for a file (cross-platform)
compute_checksum() {
    local file="$1"
    if [ -f "$file" ]; then
        if command_exists md5sum; then
            md5sum "$file" | cut -d' ' -f1
        elif command_exists md5; then
            md5 -q "$file"
        else
            # Fallback: use file size and mtime
            stat -f "%z-%m" "$file" 2>/dev/null || stat -c "%s-%Y" "$file" 2>/dev/null || echo "unknown"
        fi
    else
        echo "missing"
    fi
}

# Check if package.json has changed between source and installed
package_changed() {
    local source_pkg="$1"
    local installed_pkg="$2"

    if [ ! -f "$installed_pkg" ]; then
        return 0  # Not installed, needs install
    fi

    local source_sum=$(compute_checksum "$source_pkg")
    local installed_sum=$(compute_checksum "$installed_pkg")

    [ "$source_sum" != "$installed_sum" ]
}

# Print banner
print_banner() {
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "   ___  ____   ____    _       ___  ____  "
    echo "  / _ \|  _ \ / ___|  / \     / _ \/ ___| "
    echo " | | | | |_) | |     / _ \   | | | \___ \ "
    echo " | |_| |  _ <| |___ / ___ \  | |_| |___) |"
    echo "  \___/|_| \_\\____/_/   \_\  \___/|____/ "
    echo ""
    echo -e "${NC}${BOLD}  Orchestrated Response Coordination Architecture${NC}"
    if [ $UPGRADE_MODE -eq 1 ]; then
        echo -e "  ${GREEN}UPGRADE MODE${NC} - Version ${ORCA_VERSION}"
    else
        echo -e "  Version ${ORCA_VERSION}"
    fi
    echo ""
}

# Print section header
section() {
    echo ""
    echo -e "${BLUE}${BOLD}==> $1${NC}"
}

# Print info message
info() {
    echo -e "    ${CYAN}$1${NC}"
}

# Print success message
success() {
    echo -e "    ${GREEN}[OK]${NC} $1"
}

# Print warning message
warn() {
    echo -e "    ${YELLOW}[WARN]${NC} $1"
}

# Print error message
error() {
    echo -e "    ${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    section "Checking prerequisites"

    local missing=0

    # Check Node.js
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2)
        local node_major=$(echo "$node_version" | cut -d'.' -f1)
        if [ "$node_major" -ge 18 ]; then
            success "Node.js v$node_version"
        else
            warn "Node.js v$node_version (v18+ recommended)"
        fi
    else
        error "Node.js not found"
        info "Install from https://nodejs.org"
        missing=1
    fi

    # Check npm
    if command_exists npm; then
        success "npm $(npm -v)"
    else
        error "npm not found"
        missing=1
    fi

    # Check npx
    if command_exists npx; then
        success "npx available"
    else
        error "npx not found"
        missing=1
    fi

    # Check Claude Code
    if command_exists claude; then
        success "Claude Code $(claude --version 2>/dev/null || echo 'installed')"
    else
        error "Claude Code not found"
        info "Install with: npm install -g @anthropic-ai/claude-code"
        missing=1
    fi

    # Check Python (optional, for some MCPs)
    if command_exists python3; then
        success "Python3 $(python3 --version | cut -d' ' -f2)"
    else
        warn "Python3 not found (optional, needed for some features)"
    fi

    if [ $missing -eq 1 ]; then
        echo ""
        error "Missing required dependencies. Please install them and try again."
        exit 1
    fi
}

# Backup existing configuration
backup_existing() {
    section "Checking existing configuration"

    if [ -d "$CLAUDE_DIR" ]; then
        if [ $UPGRADE_MODE -eq 1 ]; then
            # Upgrade mode: auto-backup without prompting
            info "Existing installation found - creating backup..."
            cp -r "$CLAUDE_DIR" "$BACKUP_DIR"
            success "Backup created at $BACKUP_DIR"
            MERGE_MODE=1  # Preserve user configs in upgrade mode
        elif [ -t 0 ]; then
            # Interactive mode - ask for confirmation
            warn "Existing ~/.claude directory found"
            echo ""
            echo -e "    ${YELLOW}Options:${NC}"
            echo "    1) Backup existing config and continue (recommended)"
            echo "    2) Merge with existing config"
            echo "    3) Abort installation"
            echo ""
            read -p "    Select option [1]: " choice
            choice=${choice:-1}

            case $choice in
                1)
                    info "Backing up to $BACKUP_DIR"
                    cp -r "$CLAUDE_DIR" "$BACKUP_DIR"
                    success "Backup created"
                    ;;
                2)
                    info "Will merge with existing configuration"
                    MERGE_MODE=1
                    ;;
                3)
                    info "Installation aborted"
                    exit 0
                    ;;
                *)
                    error "Invalid option"
                    exit 1
                    ;;
            esac
        else
            # Non-interactive mode - backup automatically
            info "Backing up to $BACKUP_DIR"
            cp -r "$CLAUDE_DIR" "$BACKUP_DIR"
            success "Backup created"
        fi
    else
        if [ $UPGRADE_MODE -eq 1 ]; then
            warn "No existing installation found - running full install"
            UPGRADE_MODE=0  # Fall back to full install
        fi
        info "No existing configuration found"
        mkdir -p "$CLAUDE_DIR"
    fi
}

# Install ORCA files
install_orca_files() {
    section "Installing ORCA-OS files"

    # Create directory structure
    local dirs=(
        "agents/dev"
        "agents/iOS"
        "agents/expo"
        "agents/research"
        "agents/seo"
        "agents/data"
        "commands"
        "skills"
        "hooks"
        "scripts/utilities"
        "scripts/lint"
        "scripts/analytics"
        "scripts/os2-cleanup"
        "mcp/project-context-server"
        "mcp/cognition-mcp"
        "mcp/crawl4ai-mcp-server"
        "docs/pipelines"
        "docs/concepts"
        "docs/reference/phase-configs"
        "quick-reference"
        "orchestration/temp"
        "orchestration/evidence"
        "orchestration/playbooks"
        "orchestration/reference"
        "memory"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$CLAUDE_DIR/$dir"
    done
    success "Directory structure created"

    # Copy agents
    info "Installing agents..."
    for domain in dev iOS expo research seo data; do
        if [ -d "$ORCA_ROOT/agents/$domain" ]; then
            cp -r "$ORCA_ROOT/agents/$domain/"* "$CLAUDE_DIR/agents/$domain/" 2>/dev/null || true
        fi
    done
    # Copy root-level shared agents
    cp "$ORCA_ROOT/agents/"*.md "$CLAUDE_DIR/agents/" 2>/dev/null || true
    success "Agents installed (89 agents across 6 domains)"

    # Copy commands (excluding domain-specific)
    info "Installing commands..."
    for cmd in "$ORCA_ROOT/commands/"*.md; do
        local filename=$(basename "$cmd")
        case "$filename" in
            kg.md|shopify.md|trading-*.md)
                # Skip domain-specific commands
                ;;
            *)
                cp "$cmd" "$CLAUDE_DIR/commands/"
                ;;
        esac
    done
    success "Commands installed"

    # Copy skills (excluding domain-specific)
    info "Installing skills..."
    for skill_dir in "$ORCA_ROOT/skills/"*/; do
        local skill_name=$(basename "$skill_dir")
        case "$skill_name" in
            mm-*|uxscii-*|creative-strategist|shopify-theme|liquid-quick)
                # Skip domain-specific skills
                ;;
            *)
                cp -r "$skill_dir" "$CLAUDE_DIR/skills/"
                ;;
        esac
    done
    success "Skills installed"

    # Copy hooks (excluding archive)
    info "Installing hooks..."
    for hook in "$ORCA_ROOT/hooks/"*.sh; do
        if [ -f "$hook" ]; then
            cp "$hook" "$CLAUDE_DIR/hooks/"
            chmod +x "$CLAUDE_DIR/hooks/$(basename "$hook")"
        fi
    done
    success "Hooks installed"

    # Copy scripts (excluding archive)
    info "Installing scripts..."
    cp "$ORCA_ROOT/scripts/"*.sh "$CLAUDE_DIR/scripts/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/scripts/utilities/"* "$CLAUDE_DIR/scripts/utilities/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/scripts/lint/"* "$CLAUDE_DIR/scripts/lint/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/scripts/analytics/"* "$CLAUDE_DIR/scripts/analytics/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/scripts/os2-cleanup/"* "$CLAUDE_DIR/scripts/os2-cleanup/" 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/scripts/"*.sh 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/scripts/utilities/"*.sh 2>/dev/null || true
    success "Scripts installed"

    # Copy docs (excluding domain-specific)
    info "Installing documentation..."
    cp "$ORCA_ROOT/docs/concepts/"*.md "$CLAUDE_DIR/docs/concepts/" 2>/dev/null || true
    for pipeline in "$ORCA_ROOT/docs/pipelines/"*.md; do
        local filename=$(basename "$pipeline")
        case "$filename" in
            kg-*|shopify-*|seo-*)
                # Skip domain-specific pipelines
                ;;
            *)
                cp "$pipeline" "$CLAUDE_DIR/docs/pipelines/"
                ;;
        esac
    done
    success "Documentation installed"

    # Copy quick-reference (excluding domain-specific)
    info "Installing quick references..."
    for ref in "$ORCA_ROOT/quick-reference/"*.md; do
        local filename=$(basename "$ref")
        case "$filename" in
            readme-shopify.md|readme-seo.md)
                # Skip domain-specific
                ;;
            *)
                cp "$ref" "$CLAUDE_DIR/quick-reference/"
                ;;
        esac
    done
    success "Quick references installed"

    # Copy ProjectContext MCP
    info "Installing ProjectContext MCP..."
    cp -r "$ORCA_ROOT/mcp/project-context-server/src" "$CLAUDE_DIR/mcp/project-context-server/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/mcp/project-context-server/dist" "$CLAUDE_DIR/mcp/project-context-server/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/project-context-server/package.json" "$CLAUDE_DIR/mcp/project-context-server/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/project-context-server/tsconfig.json" "$CLAUDE_DIR/mcp/project-context-server/" 2>/dev/null || true
    success "ProjectContext MCP installed"

    # Copy Cognition MCP
    info "Installing Cognition MCP..."
    cp -r "$ORCA_ROOT/mcp/cognition-mcp/src" "$CLAUDE_DIR/mcp/cognition-mcp/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/mcp/cognition-mcp/dist" "$CLAUDE_DIR/mcp/cognition-mcp/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/cognition-mcp/package.json" "$CLAUDE_DIR/mcp/cognition-mcp/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/cognition-mcp/tsconfig.json" "$CLAUDE_DIR/mcp/cognition-mcp/" 2>/dev/null || true
    success "Cognition MCP installed"

    # Copy Crawl4AI MCP Server
    info "Installing Crawl4AI MCP Server..."
    cp -r "$ORCA_ROOT/mcp/crawl4ai-mcp-server/crawler_agent" "$CLAUDE_DIR/mcp/crawl4ai-mcp-server/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/crawl4ai-mcp-server/requirements.txt" "$CLAUDE_DIR/mcp/crawl4ai-mcp-server/" 2>/dev/null || true
    mkdir -p "$CLAUDE_DIR/mcp/crawl4ai-mcp-server/crawls"
    success "Crawl4AI MCP Server files installed"

    # Copy root files
    info "Installing configuration files..."
    cp "$ORCA_ROOT/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md" 2>/dev/null || true
    cp "$ORCA_ROOT/settings.local.json" "$CLAUDE_DIR/settings.local.json" 2>/dev/null || true
    cp "$ORCA_ROOT/statusline.sh" "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true
    success "Configuration files installed"
}

# Install MCP dependencies
install_mcp_dependencies() {
    section "Installing MCP dependencies"

    local skipped_count=0

    # Install ProjectContext MCP dependencies
    if [ -f "$CLAUDE_DIR/mcp/project-context-server/package.json" ]; then
        local source_pkg="$ORCA_ROOT/mcp/project-context-server/package.json"
        local installed_pkg="$CLAUDE_DIR/mcp/project-context-server/package.json"

        if [ $UPGRADE_MODE -eq 1 ] && ! package_changed "$source_pkg" "$installed_pkg" && [ -d "$CLAUDE_DIR/mcp/project-context-server/node_modules" ]; then
            success "ProjectContext MCP unchanged (skipped)"
            ((skipped_count++))
        else
            info "Installing ProjectContext MCP dependencies..."
            cd "$CLAUDE_DIR/mcp/project-context-server"
            npm install --silent 2>/dev/null || npm install

            # Build if needed
            if [ -f "tsconfig.json" ] && [ ! -d "dist" ]; then
                info "Building ProjectContext MCP..."
                npm run build --silent 2>/dev/null || npx tsc
            fi
            cd - > /dev/null
            success "ProjectContext MCP ready"
        fi
    fi

    # Install Cognition MCP dependencies
    if [ -f "$CLAUDE_DIR/mcp/cognition-mcp/package.json" ]; then
        local source_pkg="$ORCA_ROOT/mcp/cognition-mcp/package.json"
        local installed_pkg="$CLAUDE_DIR/mcp/cognition-mcp/package.json"

        if [ $UPGRADE_MODE -eq 1 ] && ! package_changed "$source_pkg" "$installed_pkg" && [ -d "$CLAUDE_DIR/mcp/cognition-mcp/node_modules" ]; then
            success "Cognition MCP unchanged (skipped)"
            ((skipped_count++))
        else
            info "Installing Cognition MCP dependencies..."
            cd "$CLAUDE_DIR/mcp/cognition-mcp"
            npm install --silent 2>/dev/null || npm install

            # Build if needed
            if [ -f "tsconfig.json" ] && [ ! -d "dist" ]; then
                info "Building Cognition MCP..."
                npm run build --silent 2>/dev/null || npx tsc
            fi
            cd - > /dev/null
            success "Cognition MCP ready"
        fi
    fi

    # Install Crawl4AI MCP Server dependencies (Python-based)
    if [ -f "$CLAUDE_DIR/mcp/crawl4ai-mcp-server/requirements.txt" ]; then
        local venv_dir="$CLAUDE_DIR/mcp/crawl4ai-mcp-server/.venv"

        # In upgrade mode, skip if venv exists and has playwright
        if [ $UPGRADE_MODE -eq 1 ] && [ -d "$venv_dir" ] && [ -f "$venv_dir/bin/playwright" ]; then
            success "Crawl4AI MCP Server unchanged (skipped)"
            ((skipped_count++))
        else
            info "Setting up Crawl4AI MCP Server..."
            cd "$CLAUDE_DIR/mcp/crawl4ai-mcp-server"

            # Create Python virtual environment
            if [ ! -d ".venv" ]; then
                info "Creating Python virtual environment..."
                python3 -m venv .venv
            fi

            # Install Python dependencies
            info "Installing Python dependencies..."
            .venv/bin/pip install --quiet -r requirements.txt 2>/dev/null || .venv/bin/pip install -r requirements.txt

            # Install Playwright browsers (the slowest part)
            if [ ! -f "$venv_dir/lib/python"*/site-packages/playwright/driver/package/.local-browsers/chromium-*/chrome-linux/chrome ] && \
               [ ! -d "$HOME/Library/Caches/ms-playwright/chromium-"* ]; then
                info "Installing Playwright browsers (this may take a moment)..."
                .venv/bin/python -m playwright install chromium 2>/dev/null || true
            else
                success "Playwright browsers already installed"
            fi

            cd - > /dev/null
            success "Crawl4AI MCP Server ready"
        fi
    fi

    if [ $UPGRADE_MODE -eq 1 ] && [ $skipped_count -gt 0 ]; then
        info "Skipped $skipped_count unchanged MCP(s) for faster upgrade"
    fi
}

# Configure MCP servers in ~/.claude.json
configure_mcp_servers() {
    section "Configuring MCP servers"

    local claude_json="$HOME/.claude.json"

    # Check if ~/.claude.json exists
    if [ -f "$claude_json" ]; then
        info "Existing ~/.claude.json found"

        # Check if it's valid JSON
        if ! python3 -c "import json; json.load(open('$claude_json'))" 2>/dev/null; then
            warn "Invalid JSON in ~/.claude.json, backing up and creating new"
            cp "$claude_json" "${claude_json}.bak"
            echo '{}' > "$claude_json"
        fi
    else
        echo '{}' > "$claude_json"
    fi

    # Interactive: Ask about optional MCPs (skip in upgrade mode - preserve existing)
    local install_xcode="n"
    local install_playwright="n"
    local install_puppeteer="n"
    local install_devtools="n"

    if [ $UPGRADE_MODE -eq 1 ]; then
        info "Preserving existing optional MCP configurations"
    elif [ -t 0 ]; then
        echo ""
        echo -e "    ${YELLOW}Optional MCP servers (browser automation):${NC}"
        read -p "    Install XcodeBuildMCP (iOS/macOS development)? [y/N]: " install_xcode
        read -p "    Install Playwright (browser automation)? [y/N]: " install_playwright
        read -p "    Install Puppeteer (browser automation)? [y/N]: " install_puppeteer
        read -p "    Install Chrome DevTools (debugging)? [y/N]: " install_devtools
        echo ""
    fi

    # Add MCP server configurations using python for JSON manipulation
    info "Adding MCP server configurations..."

    python3 << PYTHON_SCRIPT
import json
import os

claude_json_path = os.path.expanduser("~/.claude.json")
claude_dir = os.path.expanduser("~/.claude")

# Read existing config
with open(claude_json_path, 'r') as f:
    config = json.load(f)

# Ensure mcpServers exists
if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Core MCP servers (always installed)
core_servers = {
    "context7": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@upstash/context7-mcp"],
        "env": {}
    },
    "sequential-thinking": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
        "env": {}
    },
    "project-context": {
        "type": "stdio",
        "command": "node",
        "args": [f"{claude_dir}/mcp/project-context-server/dist/index.js"],
        "env": {}
    },
    "cognition-mcp": {
        "type": "stdio",
        "command": "node",
        "args": [f"{claude_dir}/mcp/cognition-mcp/dist/index.js"],
        "env": {}
    },
    "crawl4ai": {
        "type": "stdio",
        "command": f"{claude_dir}/mcp/crawl4ai-mcp-server/.venv/bin/python",
        "args": ["-m", "crawler_agent.mcp_server"],
        "env": {
            "PYTHONPATH": f"{claude_dir}/mcp/crawl4ai-mcp-server"
        }
    }
}

# Add core servers
for name, config_val in core_servers.items():
    if name not in config['mcpServers']:
        config['mcpServers'][name] = config_val
        print(f"    Added: {name}")
    else:
        print(f"    Exists: {name}")

# Optional servers based on user choice
optional_servers = {}

if "${install_xcode}".lower() in ['y', 'yes']:
    optional_servers["XcodeBuildMCP"] = {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "xcodebuildmcp@latest"],
        "env": {}
    }

if "${install_playwright}".lower() in ['y', 'yes']:
    optional_servers["playwright"] = {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@playwright/mcp@latest", "--headless", "--caps", "vision"],
        "env": {}
    }

if "${install_puppeteer}".lower() in ['y', 'yes']:
    optional_servers["puppeteer"] = {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@anthropic-ai/puppeteer-mcp"],
        "env": {}
    }

if "${install_devtools}".lower() in ['y', 'yes']:
    optional_servers["chrome-devtools"] = {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "chrome-devtools-mcp@latest"],
        "env": {}
    }

# Add optional servers
for name, config_val in optional_servers.items():
    if name not in config['mcpServers']:
        config['mcpServers'][name] = config_val
        print(f"    Added: {name}")
    else:
        print(f"    Exists: {name}")

# Write updated config
with open(claude_json_path, 'w') as f:
    json.dump(config, f, indent=2)

print("    MCP servers configured")
PYTHON_SCRIPT

    success "MCP servers configured in ~/.claude.json"
}

# Initialize memory systems
init_memory_systems() {
    section "Initializing memory systems"

    # Create memory directory structure
    mkdir -p "$CLAUDE_DIR/memory"

    # Try to install Workshop CLI if pip is available
    if ! command_exists workshop; then
        if command_exists pip3; then
            info "Installing Workshop CLI..."
            pip3 install --quiet workshop-cli 2>/dev/null && success "Workshop CLI installed" || warn "Could not install Workshop CLI"
        elif command_exists pip; then
            info "Installing Workshop CLI..."
            pip install --quiet workshop-cli 2>/dev/null && success "Workshop CLI installed" || warn "Could not install Workshop CLI"
        else
            warn "pip not found - Workshop CLI not installed"
            info "Install manually with: pip install workshop-cli"
        fi
    fi

    # Initialize Workshop if available
    if command_exists workshop; then
        info "Initializing Workshop database..."
        workshop --workspace "$CLAUDE_DIR/memory" init 2>/dev/null || true
        success "Workshop initialized at ~/.claude/memory/workshop.db"
    fi

    # Initialize vibe.db if vibe-sync.py exists
    if [ -f "$CLAUDE_DIR/scripts/vibe-sync.py" ]; then
        info "Initializing vibe.db (code search index)..."
        python3 "$CLAUDE_DIR/scripts/vibe-sync.py" init 2>/dev/null || true
        success "vibe.db initialized at ~/.claude/memory/vibe.db"
    fi

    success "Memory systems ready"
}

# Show what's new in this version (for upgrades)
show_whats_new() {
    if [ $UPGRADE_MODE -eq 0 ]; then
        return
    fi

    section "What's New in v${ORCA_VERSION}"

    # This section can be updated with each release
    echo ""
    echo -e "  ${BOLD}v4.0.0 Highlights:${NC}"
    echo "     - New unified orchestrator architecture"
    echo "     - 89 specialized agents across 6 domains"
    echo "     - Crawl4AI MCP for web research"
    echo "     - Cognition MCP with 38 reasoning operations"
    echo "     - Improved ProjectContext with semantic search"
    echo "     - Fast --upgrade mode for existing users"
    echo ""
}

# Print completion message
print_completion() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))

    echo ""
    echo -e "${GREEN}${BOLD}"
    if [ $UPGRADE_MODE -eq 1 ]; then
        echo "  Upgrade complete!"
    else
        echo "  Installation complete!"
    fi
    echo -e "${NC}"
    echo ""
    echo -e "  ORCA-OS v${ORCA_VERSION} has been installed to ~/.claude ${CYAN}(${duration}s)${NC}"
    echo ""

    # Show what's new for upgrades
    if [ $UPGRADE_MODE -eq 1 ]; then
        show_whats_new
    else
        echo -e "  ${BOLD}Core MCPs installed:${NC}"
        echo "     - context7 (library documentation)"
        echo "     - project-context (memory & semantic search)"
        echo "     - cognition-mcp (38 reasoning operations)"
        echo "     - crawl4ai (web scraping & research)"
        echo "     - sequential-thinking (multi-step reasoning)"
        echo ""
        echo -e "  ${BOLD}Memory systems:${NC}"
        echo "     - Workshop: ~/.claude/memory/workshop.db"
        echo "     - vibe.db: ~/.claude/memory/vibe.db"
        echo ""
    fi

    echo -e "  ${BOLD}Next steps:${NC}"
    echo ""
    echo "  1. Restart Claude Code to load the new configuration"
    echo ""
    if [ $UPGRADE_MODE -eq 0 ]; then
        echo "  2. Start using ORCA-OS commands:"
        echo "     /plan       - Plan a complex task"
        echo "     /orca       - Invoke the orchestrator"
        echo "     /ios        - iOS development pipeline"
        echo "     /nextjs     - Next.js development pipeline"
        echo "     /expo       - Expo/React Native pipeline"
        echo "     /research   - Deep research pipeline"
        echo ""
        echo -e "  ${BOLD}Documentation:${NC}"
        echo "     - See ~/.claude/docs/mcp-setup.md for MCP details"
        echo ""
    fi

    if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
        echo -e "  ${YELLOW}Your previous configuration was backed up to:${NC}"
        echo "     $BACKUP_DIR"
        echo ""
    fi

    # Upgrade tip for fresh installs
    if [ $UPGRADE_MODE -eq 0 ]; then
        echo -e "  ${CYAN}Tip: Future upgrades can use: ./install.sh --upgrade${NC}"
        echo ""
    fi
}

# Main installation flow
main() {
    print_banner
    check_prerequisites
    backup_existing
    install_orca_files
    install_mcp_dependencies
    configure_mcp_servers
    init_memory_systems
    print_completion
}

# Run main
main "$@"
