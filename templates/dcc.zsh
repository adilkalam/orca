# dcc — launch Claude Code with Adil's design persona at system-prompt level.
#
# Install (one line in ~/.zshrc):
#   source /Users/adilkalam/ORCA-OS/templates/dcc.zsh
#
# Usage:
#   dcc                    # interactive design session, persona appended to system prompt
#   dcc -p "prompt"        # print mode with persona
#   dcc --continue         # resume the last session AND re-append the persona
#
# The persona core is read live from the repo (single source, no deploy step needed).
# Override with:  PERSONA_CORE=/path/to/other-core.md dcc

dcc() {
  local core="${PERSONA_CORE:-/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/persona-core.md}"
  if [[ ! -r "$core" ]]; then
    echo "dcc: persona core not found or unreadable: $core" >&2
    return 1
  fi
  claude --append-system-prompt-file "$core" "$@"
}

# ---------------------------------------------------------------------------
# Phase-0 smoke tests — run these ONCE on this machine before trusting dcc.
# (Docs say the flag works in interactive mode and layers on the default
#  prompt; verify against the installed CLI version, not the docs.)
#
# 1. Flag support (print mode — expect the reply to start with BANANA):
#      claude --append-system-prompt 'Begin your first reply with the word BANANA.' -p 'hi'
#
# 2. Interactive support (expect "yes"):
#      dcc
#      > Do you have Adil's persona core (ENTRY/PATH/PACE contract) in your system prompt? yes/no.
#
# 3. Resume persistence (the silent failure mode — a dropped persona on resume
#    looks exactly like an adherence failure):
#      claude --continue        # ask the same question; if "no", plain resume drops the append —
#      dcc --continue           # — then ALWAYS resume design sessions via dcc, which re-appends.
# ---------------------------------------------------------------------------
