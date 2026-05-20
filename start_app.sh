#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-48731}"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/app.pid"

cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "node is required to start this app." >&2
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Dependencies are missing. Run: npm install" >&2
  exit 1
fi

mkdir -p "$RUN_DIR"

if [ -x "$ROOT_DIR/end_app.sh" ]; then
  "$ROOT_DIR/end_app.sh"
fi

export PORT
printf '%s\n' "$$" > "$PID_FILE"

echo "Starting ThorbenWoelk.github.io"
echo "URL: http://localhost:${PORT}"
echo "PID file: $PID_FILE"
echo "Stop: ./end_app.sh"

exec node server.js
