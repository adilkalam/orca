#!/usr/bin/env bash
# RVRY Research Session-Start Hook
# Outputs RunPod MCP query reminder to stdout so the agent sees it immediately.
# The agent (rvry-research-light-orchestrator) then queries RunPod MCP for live state.
#
# Install: deploy to ~/.claude/hooks/ and reference in project's .claude/settings.local.json
# Target project: ~/rvry-engine

set -uo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# Only activate for rvry-engine
case "$ROOT_DIR" in
  *rvry-engine*) ;;
  *) exit 0 ;;
esac

echo ""
echo "==============================================================="
echo "RVRY RESEARCH: POD STATE REQUIRED"
echo "==============================================================="
echo ""
echo "MANDATORY: Query RunPod MCP before any pod work."
echo "  mcp__runpod__list-pods()  -- get all pods"
echo "  mcp__runpod__get-pod(id)  -- get details for active pods"
echo ""
echo "Extract: pod name, IP, SSH port, GPU type, status, cost/hr."
echo "Do NOT use cached/stale pod information from memory or CLAUDE.md."
echo ""
echo "Research registry: research/experiment-registry.yaml"
echo "==============================================================="
echo ""

exit 0
