#!/usr/bin/env bash
#
# dev.sh — launch every gym service in a single tmux session with split panes.
#
# Detects which services are scaffolded (backend/, website/, app/) and creates
# one pane per service. Missing directories are skipped with a warning, so the
# script works today (only backend exists) and keeps working once website/app
# are added.
#
# Re-running the script kills the existing "gym" session and starts fresh.
#
# Usage:
#   ./dev.sh              # start and attach
#   ./dev.sh --detach     # start in the background
#   ./dev.sh --kill       # stop the session

set -euo pipefail

SESSION="gym"
ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="attach" # attach | detach | kill

for arg in "$@"; do
  case "$arg" in
    -d|--detach) MODE="detach" ;;
    -k|--kill)   MODE="kill"   ;;
    -h|--help)
      cat <<EOF
Usage: ./dev.sh [OPTIONS]
  -d, --detach    Start the tmux session and return to the current shell
  -k, --kill      Stop a running gym session
  -h, --help      Show this help
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if ! command -v tmux >/dev/null 2>&1; then
  echo "error: tmux is not installed. Install it with your package manager." >&2
  exit 1
fi

# --kill just tears the session down and exits.
if [ "$MODE" = "kill" ]; then
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux kill-session -t "$SESSION"
    echo "gym session stopped"
  else
    echo "no gym session running"
  fi
  exit 0
fi

# -------------------------------------------------------------------------
# Discover services
# -------------------------------------------------------------------------
# Each entry is "name|subdir|command". Edit add_service calls below to
# register additional services.
services=()

add_service() {
  local name="$1" dir="$2" cmd="$3"
  if [ -f "$ROOT/$dir/package.json" ]; then
    services+=("$name|$dir|$cmd")
  else
    printf "skip: %-8s (no %s/package.json yet)\n" "$name" "$dir"
  fi
}

add_service "backend" "backend" "npm run develop"
add_service "website" "website" "npm run dev"
add_service "app"     "app"     "npm run dev"

if [ ${#services[@]} -eq 0 ]; then
  echo "error: no services found — scaffold backend/, website/, or app/ first" >&2
  exit 1
fi

# -------------------------------------------------------------------------
# (Re)start the tmux session
# -------------------------------------------------------------------------
tmux kill-session -t "$SESSION" 2>/dev/null || true

# First service → new session + first pane.
IFS='|' read -r name dir cmd <<<"${services[0]}"
tmux new-session -d -s "$SESSION" -n gym -c "$ROOT/$dir"
firstpane=$(tmux list-panes -t "$SESSION:0" -F '#{pane_id}' | head -n1)
tmux select-pane -t "$firstpane" -T "$name"
tmux send-keys -t "$firstpane" "clear && printf '\\033[1;36m=== %s ===\\033[0m\\n' '$name' && $cmd" C-m

# Remaining services → split new panes.
for ((i = 1; i < ${#services[@]}; i++)); do
  IFS='|' read -r name dir cmd <<<"${services[$i]}"
  newpane=$(tmux split-window -t "$SESSION:0" -c "$ROOT/$dir" -P -F '#{pane_id}')
  tmux select-pane -t "$newpane" -T "$name"
  tmux send-keys -t "$newpane" "clear && printf '\\033[1;36m=== %s ===\\033[0m\\n' '$name' && $cmd" C-m
  tmux select-layout -t "$SESSION:0" tiled
done

# Tweak the status bar so each pane shows its service name.
tmux set-option -t "$SESSION" pane-border-status top 2>/dev/null || true
tmux set-option -t "$SESSION" pane-border-format " #{pane_title} " 2>/dev/null || true

tmux select-pane -t "$firstpane"

# -------------------------------------------------------------------------
# Attach (or skip, if requested / already inside tmux)
# -------------------------------------------------------------------------
if [ "$MODE" = "detach" ]; then
  echo "gym dev session started. Attach with: tmux attach -t $SESSION"
  exit 0
fi

if [ -n "${TMUX:-}" ]; then
  tmux switch-client -t "$SESSION"
else
  tmux attach-session -t "$SESSION"
fi
