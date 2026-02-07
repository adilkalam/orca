#!/bin/bash
cd /Users/adilkalam/ORCA-OS/mcp/adb-mcp/mcp
exec /Users/adilkalam/.local/bin/uv run \
  --no-project \
  --with fonttools \
  --with python-socketio \
  --with "mcp[cli]" \
  --with requests \
  --with "websocket-client>=1.8.0" \
  --with "pillow>=11.2.1" \
  --with "numpy>=2.2.6" \
  python -c "import sys; sys.path.insert(0, '.'); from importlib.util import spec_from_file_location, module_from_spec; spec = spec_from_file_location('ps_mcp', 'ps-mcp.py'); mod = module_from_spec(spec); spec.loader.exec_module(mod); mod.mcp.run()"
