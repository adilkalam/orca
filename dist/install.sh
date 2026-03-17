#!/bin/bash
# ORCA-OS Installer v3.2.0
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
ORCA_VERSION="7.0.0"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCA_ROOT="$(dirname "$SCRIPT_DIR")"

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
    echo -e "  Version ${ORCA_VERSION}"
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

    # Check Bun (optional, for orca-record recording layer)
    if command_exists bun; then
        success "Bun $(bun --version 2>/dev/null || echo 'installed')"
    else
        warn "Bun not found (optional, needed for session recording)"
        info "Install from https://bun.sh"
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
        warn "Existing ~/.claude directory found"

        # Interactive mode - ask for confirmation
        if [ -t 0 ]; then
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
        "agents/nextjs"
        "agents/os-dev"
        "agents/iOS"
        "agents/expo"
        "agents/research"
        "agents/data"
        "agents/django-react"
        "agents/typography"
        "agents/cross-domain"
        "commands"
        "skills"
        "hooks"
        "scripts/utilities"
        "bin"
        "mcp/project-context-server"
        "mcp/bambu-3mf"
        "mcp/bambu-mcp-agent"
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
    for domain in dev nextjs os-dev iOS expo research data django-react typography cross-domain; do
        if [ -d "$ORCA_ROOT/agents/$domain" ]; then
            cp -r "$ORCA_ROOT/agents/$domain/"* "$CLAUDE_DIR/agents/$domain/" 2>/dev/null || true
        fi
    done
    # Remove legacy/private directories from previous installs
    # Remove legacy/private directories from previous installs
    rm -rf "$CLAUDE_DIR/agents/orca-dev" 2>/dev/null || true
    rm -rf "$CLAUDE_DIR/agents/shopify" 2>/dev/null || true
    rm -rf "$CLAUDE_DIR/agents/kg" 2>/dev/null || true
    rm -rf "$CLAUDE_DIR/agents/seo" 2>/dev/null || true
    rm -rf "$CLAUDE_DIR/agents/rvry" 2>/dev/null || true
    rm -rf "$CLAUDE_DIR/agents/audit" 2>/dev/null || true
    success "Agents installed"

    # Copy commands (excluding domain-specific)
    info "Installing commands..."
    for cmd in "$ORCA_ROOT/commands/"*.md; do
        local filename=$(basename "$cmd")
        case "$filename" in
            trading-*.md|kg.md|seo.md|rvry.md|shopify.md|deepthink-local.md|problem-solve-local.md|think.md|deepthink.md|problem-solve.md|challenge.md|meta.md|contemplate.md)
                # Skip private/excluded commands
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
            mm-*|uxscii-*|shopify-app-development)
                # Skip private/client-specific skills
                ;;
            *)
                # Remove trailing slash to copy directory, not contents
                cp -r "${skill_dir%/}" "$CLAUDE_DIR/skills/"
                ;;
        esac
    done
    # Also copy standalone skill files (*.md)
    cp "$ORCA_ROOT/skills/"*.md "$CLAUDE_DIR/skills/" 2>/dev/null || true
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

    # Copy scripts (excluding archive and deprecated telemetry)
    info "Installing scripts..."
    for script in "$ORCA_ROOT/scripts/"*.sh; do
        local sname=$(basename "$script")
        case "$sname" in
            telemetry-*.sh|sync-to-orca.sh)
                # Skip deprecated telemetry scripts and internal sync
                ;;
            *)
                cp "$script" "$CLAUDE_DIR/scripts/"
                ;;
        esac
    done
    cp "$ORCA_ROOT/scripts/"*.py "$CLAUDE_DIR/scripts/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/scripts/utilities/"* "$CLAUDE_DIR/scripts/utilities/" 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/scripts/"*.sh 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/scripts/utilities/"*.sh 2>/dev/null || true
    success "Scripts installed"

    # Copy docs (excluding domain-specific)
    info "Installing documentation..."
    cp "$ORCA_ROOT/docs/concepts/"*.md "$CLAUDE_DIR/docs/concepts/" 2>/dev/null || true
    for pipeline in "$ORCA_ROOT/docs/pipelines/"*.md; do
        local filename=$(basename "$pipeline")
        case "$filename" in
            kg-*|shopify-*|seo-*|rvry-*)
                # Skip private pipeline docs
                ;;
            *)
                cp "$pipeline" "$CLAUDE_DIR/docs/pipelines/"
                ;;
        esac
    done
    # Remove private docs if they exist from previous installs
    rm -f "$CLAUDE_DIR/docs/THESIS.md" 2>/dev/null || true
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

    # Copy Bambu 3MF MCP
    info "Installing Bambu 3MF MCP..."
    cp -r "$ORCA_ROOT/mcp/bambu-3mf/src" "$CLAUDE_DIR/mcp/bambu-3mf/" 2>/dev/null || true
    cp -r "$ORCA_ROOT/mcp/bambu-3mf/dist" "$CLAUDE_DIR/mcp/bambu-3mf/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/bambu-3mf/package.json" "$CLAUDE_DIR/mcp/bambu-3mf/" 2>/dev/null || true
    cp "$ORCA_ROOT/mcp/bambu-3mf/tsconfig.json" "$CLAUDE_DIR/mcp/bambu-3mf/" 2>/dev/null || true
    success "Bambu 3MF MCP installed"

    # Copy Bambu MCP Agent (Python-based analysis)
    if [ -d "$ORCA_ROOT/mcp/bambu-mcp-agent" ]; then
        info "Installing Bambu MCP Agent..."
        mkdir -p "$CLAUDE_DIR/mcp/bambu-mcp-agent"
        cp -r "$ORCA_ROOT/mcp/bambu-mcp-agent/src" "$CLAUDE_DIR/mcp/bambu-mcp-agent/" 2>/dev/null || true
        cp "$ORCA_ROOT/mcp/bambu-mcp-agent/pyproject.toml" "$CLAUDE_DIR/mcp/bambu-mcp-agent/" 2>/dev/null || true
        cp "$ORCA_ROOT/mcp/bambu-mcp-agent/requirements.txt" "$CLAUDE_DIR/mcp/bambu-mcp-agent/" 2>/dev/null || true
        success "Bambu MCP Agent installed"
    fi

    # Install orca-record (recording layer binary)
    info "Installing orca-record (session recording)..."
    if command_exists bun; then
        if [ -f "$ORCA_ROOT/mcp/orca-record/package.json" ]; then
            cd "$ORCA_ROOT/mcp/orca-record"
            if bun run build 2>/dev/null; then
                cp dist/orca-record "$CLAUDE_DIR/bin/orca-record" 2>/dev/null
                chmod +x "$CLAUDE_DIR/bin/orca-record"
                success "orca-record binary installed to ~/.claude/bin/"
            else
                warn "Failed to build orca-record"
            fi
            cd - > /dev/null
        elif [ -f "$ORCA_ROOT/mcp/orca-record/dist/orca-record" ]; then
            cp "$ORCA_ROOT/mcp/orca-record/dist/orca-record" "$CLAUDE_DIR/bin/orca-record"
            chmod +x "$CLAUDE_DIR/bin/orca-record"
            success "orca-record binary installed (pre-built)"
        fi
    else
        # Try to copy pre-built binary if it exists
        if [ -f "$ORCA_ROOT/mcp/orca-record/dist/orca-record" ]; then
            cp "$ORCA_ROOT/mcp/orca-record/dist/orca-record" "$CLAUDE_DIR/bin/orca-record"
            chmod +x "$CLAUDE_DIR/bin/orca-record"
            success "orca-record binary installed (pre-built)"
        else
            warn "Bun not found - orca-record not built"
            info "Install bun (https://bun.sh) and re-run installer for session recording"
        fi
    fi

    # Copy OpenSCAD MCP (Python-based, uses uv)
    if [ -d "$ORCA_ROOT/mcp/openscad-mcp" ]; then
        info "Installing OpenSCAD MCP..."
        mkdir -p "$CLAUDE_DIR/mcp/openscad-mcp"
        cp -r "$ORCA_ROOT/mcp/openscad-mcp/src" "$CLAUDE_DIR/mcp/openscad-mcp/" 2>/dev/null || true
        cp "$ORCA_ROOT/mcp/openscad-mcp/pyproject.toml" "$CLAUDE_DIR/mcp/openscad-mcp/" 2>/dev/null || true
        cp "$ORCA_ROOT/mcp/openscad-mcp/uv.lock" "$CLAUDE_DIR/mcp/openscad-mcp/" 2>/dev/null || true
        success "OpenSCAD MCP installed"
    fi

    # Copy reference docs for chrome-devtools-mcp and xcodebuildmcp (npx-based, no local install needed)
    for ref_mcp in chrome-devtools-mcp xcodebuildmcp; do
        if [ -d "$ORCA_ROOT/mcp/$ref_mcp/docs" ]; then
            mkdir -p "$CLAUDE_DIR/mcp/$ref_mcp"
            cp -r "$ORCA_ROOT/mcp/$ref_mcp/docs" "$CLAUDE_DIR/mcp/$ref_mcp/" 2>/dev/null || true
        fi
    done

    # Crawl4AI uses Docker - no local files needed
    info "Crawl4AI MCP will use Docker (no local install needed)"
    mkdir -p "$CLAUDE_DIR/mcp/crawl4ai-crawls"
    success "Crawl4AI output directory created"

    # Generate settings.local.json with correct hook configuration
    info "Installing configuration files..."
    if [ ! -f "$CLAUDE_DIR/settings.local.json" ] || [ "${MERGE_MODE:-0}" = "0" ]; then
        cat > "$CLAUDE_DIR/settings.local.json" << 'SETTINGS_JSON'
{
  "permissions": {
    "allow": [],
    "deny": []
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-start.sh 2>/dev/null || echo 'SessionStart: hook not found'"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/pre-compact.sh 2>/dev/null || echo 'PreCompact: hook not found'"
          }
        ]
      }
    ]
  },
  "enableAllProjectMcpServers": false
}
SETTINGS_JSON
    fi
    cp "$ORCA_ROOT/statusline.sh" "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true
    chmod +x "$CLAUDE_DIR/statusline.sh" 2>/dev/null || true
    success "Configuration files installed"
}

# Install MCP dependencies
install_mcp_dependencies() {
    section "Installing MCP dependencies"

    local mcp_errors=0

    # Check for build tools (needed for native modules like better-sqlite3)
    if ! command_exists python3; then
        warn "Python3 not found - some native modules may fail to compile"
    fi

    # Install ProjectContext MCP dependencies
    if [ -f "$CLAUDE_DIR/mcp/project-context-server/package.json" ]; then
        info "Installing ProjectContext MCP dependencies..."
        cd "$CLAUDE_DIR/mcp/project-context-server"

        if npm install 2>&1 | tee /tmp/npm-install.log | grep -q "error"; then
            error "Failed to install ProjectContext MCP dependencies"
            warn "Check /tmp/npm-install.log for details"
            warn "Common fix: Install Xcode Command Line Tools: xcode-select --install"
            ((mcp_errors++))
        else
            # Build if needed
            if [ -f "tsconfig.json" ] && [ ! -d "dist" ]; then
                info "Building ProjectContext MCP..."
                npm run build 2>&1 || npx tsc 2>&1
            fi
            success "ProjectContext MCP ready"
        fi
        cd - > /dev/null
    else
        warn "ProjectContext MCP package.json not found - skipping"
    fi

    # Install Bambu 3MF MCP dependencies (if user opted in)
    if echo "$install_bambu" | grep -qi '^y'; then
        if [ -f "$CLAUDE_DIR/mcp/bambu-3mf/package.json" ]; then
            info "Installing Bambu 3MF MCP dependencies..."
            cd "$CLAUDE_DIR/mcp/bambu-3mf"
            if npm install 2>&1 | grep -q "error"; then
                warn "Failed to install Bambu 3MF MCP dependencies"
                ((mcp_errors++))
            else
                if [ -f "tsconfig.json" ] && [ ! -d "dist" ]; then
                    info "Building Bambu 3MF MCP..."
                    npm run build 2>&1 || npx tsc 2>&1
                fi
                success "Bambu 3MF MCP ready"
            fi
            cd - > /dev/null
        fi
    fi

    if [ $mcp_errors -gt 0 ]; then
        echo ""
        warn "Some MCP servers failed to install ($mcp_errors errors)"
        warn "Run: ~/orca/dist/validate.sh to diagnose issues"
    fi
}

# Install Adobe Creative Cloud MCPs (optional)
install_adobe_mcps() {
    section "Installing Adobe Creative Cloud MCPs"

    local adb_mcp_dir="$CLAUDE_DIR/mcp/adb-mcp"

    # Check for uv (required for Adobe MCPs)
    if ! command_exists uv; then
        warn "uv package manager not found (required for Adobe MCPs)"
        info "Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
        warn "Skipping Adobe MCP installation"
        ADOBE_INSTALL_FAILED=1
        return
    fi

    # Clone adb-mcp if not already present
    if [ -d "$adb_mcp_dir" ]; then
        info "adb-mcp already installed, updating..."
        cd "$adb_mcp_dir"
        git pull --quiet 2>/dev/null || warn "Could not update adb-mcp (not a git repo or offline)"
        cd - > /dev/null
    else
        if command_exists git; then
            info "Cloning adb-mcp from GitHub..."
            git clone --quiet https://github.com/mikechambers/adb-mcp "$adb_mcp_dir" 2>/dev/null
            if [ $? -ne 0 ]; then
                error "Failed to clone adb-mcp"
                warn "Skipping Adobe MCP installation"
                ADOBE_INSTALL_FAILED=1
                return
            fi
        else
            error "git not found - cannot clone adb-mcp"
            warn "Skipping Adobe MCP installation"
            ADOBE_INSTALL_FAILED=1
            return
        fi
    fi

    # Generate run scripts with correct paths
    local mcp_dir="$adb_mcp_dir/mcp"
    local uv_path=$(which uv)

    # Photoshop run script
    cat > "$mcp_dir/run-ps-mcp.sh" << RUNSCRIPT
#!/bin/bash
cd "$mcp_dir"
exec "$uv_path" run \\
  --no-project \\
  --with fonttools \\
  --with python-socketio \\
  --with "mcp[cli]" \\
  --with requests \\
  --with "websocket-client>=1.8.0" \\
  --with "pillow>=11.2.1" \\
  --with "numpy>=2.2.6" \\
  python -c "import sys; sys.path.insert(0, '.'); from importlib.util import spec_from_file_location, module_from_spec; spec = spec_from_file_location('ps_mcp', 'ps-mcp.py'); mod = module_from_spec(spec); spec.loader.exec_module(mod); mod.mcp.run()"
RUNSCRIPT
    chmod +x "$mcp_dir/run-ps-mcp.sh"

    # Illustrator run script
    cat > "$mcp_dir/run-ai-mcp.sh" << RUNSCRIPT
#!/bin/bash
cd "$mcp_dir"
exec "$uv_path" run \\
  --no-project \\
  --with fonttools \\
  --with python-socketio \\
  --with "mcp[cli]" \\
  --with requests \\
  --with "websocket-client>=1.8.0" \\
  --with "pillow>=11.2.1" \\
  --with "numpy>=2.2.6" \\
  python -c "import sys; sys.path.insert(0, '.'); from importlib.util import spec_from_file_location, module_from_spec; spec = spec_from_file_location('ai_mcp', 'ai-mcp.py'); mod = module_from_spec(spec); spec.loader.exec_module(mod); mod.mcp.run()"
RUNSCRIPT
    chmod +x "$mcp_dir/run-ai-mcp.sh"

    success "Adobe Photoshop MCP ready"
    success "Adobe Illustrator MCP ready"
    info "Requires: Adobe apps with UXP plugins + Node proxy server"
    info "See: https://github.com/mikechambers/adb-mcp for setup details"
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

    # Interactive: Ask about optional MCPs
    local install_xcode="n"
    local install_devtools="n"
    local install_openscad="n"
    local install_bambu="n"
    local install_adobe="n"
    local install_crawl4ai="n"

    if [ -t 0 ]; then
        echo ""
        echo -e "    ${YELLOW}Development tools:${NC}"
        read -p "    Install Chrome DevTools (browser debugging, screenshots, design review)? [y/N]: " install_devtools
        read -p "    Install XcodeBuildMCP (iOS/macOS development)? [y/N]: " install_xcode
        echo ""
        echo -e "    ${YELLOW}Research tools:${NC}"
        if command_exists docker; then
            read -p "    Install Crawl4AI (web scraping for /research -- requires Docker)? [y/N]: " install_crawl4ai
        else
            warn "Docker not found -- Crawl4AI requires Docker"
            info "Install Docker first, then run: docker pull unclecode/crawl4ai"
        fi
        echo ""
        echo -e "    ${YELLOW}3D printing & creative tools:${NC}"
        read -p "    Install Bambu 3MF MCP (Bambu Studio print settings, slicing analysis)? [y/N]: " install_bambu
        read -p "    Install OpenSCAD MCP (3D modeling with OpenSCAD)? [y/N]: " install_openscad
        read -p "    Install Adobe Creative Cloud MCPs (Photoshop + Illustrator)? [y/N]: " install_adobe
        echo ""
    fi

    # Install Crawl4AI if requested (Docker-based)
    if echo "$install_crawl4ai" | grep -qi '^y'; then
        section "Setting up Crawl4AI"
        info "Pulling Crawl4AI Docker image..."
        if docker pull unclecode/crawl4ai 2>&1; then
            success "Crawl4AI image pulled"
            info "Starting Crawl4AI container..."
            docker run -d --name crawl4ai -p 11235:11235 --restart unless-stopped unclecode/crawl4ai 2>/dev/null || \
                docker start crawl4ai 2>/dev/null || true
            success "Crawl4AI running at localhost:11235"
        else
            warn "Failed to pull Crawl4AI image"
            info "Install manually: docker pull unclecode/crawl4ai"
        fi
    fi

    # Install Adobe MCPs if requested (must happen before JSON config)
    ADOBE_INSTALL_FAILED=0
    if echo "$install_adobe" | grep -qi '^y'; then
        install_adobe_mcps
        if [ $ADOBE_INSTALL_FAILED -eq 1 ]; then
            install_adobe="n"
        fi
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
    "crawl4ai": {
        "type": "sse",
        "url": "http://localhost:11235/mcp/sse"
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

if "${install_devtools}".lower() in ['y', 'yes']:
    optional_servers["chrome-devtools"] = {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "chrome-devtools-mcp@latest"],
        "env": {}
    }

if "${install_bambu}".lower() in ['y', 'yes']:
    bambu_mcp_dir = f"{claude_dir}/mcp/bambu-3mf"
    optional_servers["bambu-3mf"] = {
        "type": "stdio",
        "command": "node",
        "args": [f"{bambu_mcp_dir}/dist/index.js"],
        "env": {}
    }

if "${install_openscad}".lower() in ['y', 'yes']:
    openscad_mcp_dir = f"{claude_dir}/mcp/openscad-mcp"
    optional_servers["openscad-mcp"] = {
        "type": "stdio",
        "command": "uv",
        "args": ["--directory", openscad_mcp_dir, "run", "openscad-mcp-server"],
        "env": {}
    }

if "${install_adobe}".lower() in ['y', 'yes']:
    adb_mcp_dir = f"{claude_dir}/mcp/adb-mcp/mcp"
    optional_servers["adobe-photoshop"] = {
        "type": "stdio",
        "command": f"{adb_mcp_dir}/run-ps-mcp.sh",
        "args": [],
        "env": {}
    }
    optional_servers["adobe-illustrator"] = {
        "type": "stdio",
        "command": f"{adb_mcp_dir}/run-ai-mcp.sh",
        "args": [],
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

    # Initialize code-index.db if code-index.py exists
    if [ -f "$CLAUDE_DIR/scripts/code-index.py" ]; then
        info "Initializing code-index.db (code search index)..."
        python3 "$CLAUDE_DIR/scripts/code-index.py" init 2>/dev/null || true
        success "code-index.db initialized at ~/.claude/memory/code-index.db"
    fi

    success "Memory systems ready"
}

# Print completion message
print_completion() {
    echo ""
    echo -e "${GREEN}${BOLD}"
    echo "  Installation complete!"
    echo -e "${NC}"
    echo ""
    echo "  ORCA-OS v${ORCA_VERSION} has been installed to ~/.claude"
    echo ""
    echo -e "  ${BOLD}Core MCPs installed:${NC}"
    echo "     - context7 (library documentation)"
    echo "     - project-context (memory & semantic search)"
    echo "     - sequential-thinking (multi-step reasoning)"
    echo "     - crawl4ai (web scraping for /research)"
    echo "     - RVRY (/deepthink, /problem-solve)"
    echo ""
    if [ -f "$CLAUDE_DIR/bin/orca-record" ]; then
    echo -e "  ${BOLD}Recording layer:${NC}"
    echo "     - orca-record: ~/.claude/bin/orca-record"
    echo "     - Captures session history (tool calls, file changes)"
    echo "     - Injects relevant history before agents start work"
    echo ""
    fi
    echo -e "  ${BOLD}Optional (configured during install):${NC}"
    echo "     - Bambu 3MF: 3D print settings manipulation"
    echo "     - OpenSCAD: 3D modeling and STL analysis"
    echo "     - Adobe Photoshop + Illustrator (requires uv, Adobe apps)"
    echo ""
    if ! docker ps 2>/dev/null | grep -q crawl4ai; then
    echo -e "  ${YELLOW}Note:${NC} Crawl4AI configured but Docker container not running."
    echo "     Start it with: docker run -d --name crawl4ai -p 11235:11235 --restart unless-stopped unclecode/crawl4ai"
    echo ""
    fi
    echo ""
    echo -e "  ${BOLD}Memory systems:${NC}"
    echo "     - Workshop: ~/.claude/memory/workshop.db"
    echo "     - code-index.db: ~/.claude/memory/code-index.db"
    echo ""
    echo -e "  ${BOLD}Next steps:${NC}"
    echo ""
    echo "  1. Restart Claude Code to load the new configuration"
    echo ""
    echo "  2. Start using ORCA-OS commands:"
    echo "     /requirements  - Plan a complex task"
    echo "     /orca          - Invoke the orchestrator"
    echo "     /ios           - iOS development pipeline"
    echo "     /nextjs        - Next.js development pipeline"
    echo "     /expo          - Expo/React Native pipeline"
    echo "     /research      - Deep research pipeline"
    echo "     /design        - 3D printing and creative design"
    echo ""
    echo -e "  ${BOLD}Validate installation:${NC}"
    echo "     ~/orca/dist/validate.sh"
    echo ""
    echo -e "  ${BOLD}Documentation:${NC}"
    echo "     - See ~/.claude/docs/mcp-setup.md for MCP details"
    echo ""
    if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
        echo -e "  ${YELLOW}Your previous configuration was backed up to:${NC}"
        echo "     $BACKUP_DIR"
        echo ""
    fi
}

# Install RVRY MCP (always runs at end -- provides /deepthink, /problem-solve)
install_rvry_mcp() {
    section "Installing RVRY MCP"
    info "RVRY provides /deepthink and /problem-solve commands"
    info "Running RVRY MCP setup (auto-configures in ~/.claude.json)..."
    if npx -y @rvry/mcp setup 2>&1; then
        success "RVRY MCP configured"
    else
        warn "RVRY MCP setup failed"
        info "Install manually later: npx @rvry/mcp setup"
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
    install_rvry_mcp
    print_completion
}

# Run main
main "$@"
