#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-48731}"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/app.pid"

stop_pid() {
  local pid="$1"

  if ! kill -0 "$pid" 2>/dev/null; then
    return 0
  fi

  echo "Stopping PID $pid"
  kill "$pid" 2>/dev/null || true

  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
    sleep 0.2
  done

  echo "Force stopping PID $pid"
  kill -9 "$pid" 2>/dev/null || true
}

if [ -f "$PID_FILE" ]; then
  pid="$(cat "$PID_FILE")"
  if [ -n "$pid" ]; then
    stop_pid "$pid"
  fi
  rm -f "$PID_FILE"
fi

port_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$port_pids" ]; then
  for pid in $port_pids; do
    stop_pid "$pid"
  done
fi

if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT still has a listener." >&2
  exit 1
fi

echo "ThorbenWoelk.github.io stopped on port $PORT."
