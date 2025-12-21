# iOS Simulator Skill - Installation Complete 

**Date Installed:** 2025-10-23
**Version:** 1.0.1
**Location:** ~/.claude/skills/ios-simulator-skill

---

## Installation Summary

 **Repository Cloned** from https://github.com/conorluddy/ios-simulator-skill
 **Installed** to ~/.claude/skills/ios-simulator-skill/
 **Scripts Executable** - All Python and shell scripts
 **Prerequisites Met**:
- macOS 26.1 (Sequoia)
- Xcode Command Line Tools
- Python 3.14.0
- Available Simulators: iPhone 17 Pro, iPhone 17 Pro Max, iPhone Air, etc.

  **IDB (Optional)**: Not installed - can be added later via `brew install idb-companion`

---

## What's Included

### 12 Production Scripts

**Build & Development (2):**
- build_and_test.py - Build projects and run tests
- log_monitor.py - Real-time log streaming

**Navigation (5):**
- screen_mapper.py - Analyze screen (5-line output, 97.5% token reduction)
- navigator.py - Semantic element discovery and interaction
- gesture.py - Swipes, scrolls, pinches, drags
- keyboard.py - Text input, hardware buttons
- app_launcher.py - App lifecycle management

**Testing & Analysis (5):**
- accessibility_audit.py - WCAG compliance checking
- visual_diff.py - Screenshot regression testing
- test_recorder.py - Automated test documentation
- app_state_capture.py - Debug snapshots
- sim_health_check.sh - Environment verification

---

## Token Efficiency

| Operation | Without Skill | With Skill | Reduction |
|-----------|--------------|------------|-----------|
| Screen analysis | ~200 lines | ~5 lines | 97.5% |
| Build logs | ~500 lines | ~12 lines | 97.6% |
| Test results | ~150 lines | ~8 lines | 94.7% |

---

## How to Use

The skill is automatically available to Claude Code. Specialists will reference it when needed:

### Specialists with Simulator Support:

1. ios-swiftui-specialist - UI testing, visual diff
2. ios-uikit-specialist - UIKit testing
3. ios-accessibility-specialist - Accessibility audits
4. ios-testing-specialist - Test execution
5. ios-ui-testing-specialist - XCUITest automation
6. ios-performance-specialist - Instruments profiling

### Example Usage:

```bash
# Build and test
python ~/.claude/skills/ios-simulator-skill/skill/scripts/build_and_test.py <project_path>

# Analyze screen
python ~/.claude/skills/ios-simulator-skill/skill/scripts/screen_mapper.py

# Navigate UI
python ~/.claude/skills/ios-simulator-skill/skill/scripts/navigator.py --find-text "Login" --tap
```

---

## Verification

Run health check:
```bash
~/.claude/skills/ios-simulator-skill/skill/scripts/sim_health_check.sh
```

---

## Documentation

- **README.md** - Main documentation
- **SKILL.md** - Skill specification
- **SPECIFICATION.md** - Technical specification
- **references/** - Quick reference guides

---

## Next Steps

1.  Skill is installed and ready
2.  Use `/orca` with iOS projects - specialists will use skill automatically
3.   Optional: Install IDB for enhanced features (`brew install idb-companion`)
4.  Specialists will automatically use skill scripts for token efficiency

---

**Status:** Production-ready, integrated with 9 iOS specialists
**Integration:** Automatic (no configuration needed)
