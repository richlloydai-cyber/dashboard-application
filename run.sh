#!/usr/bin/env bash
# ============================================================
# HERMES DASHBOARD - HOST LAUNCH SCRIPT
# Run this from a NORMAL WSL terminal (NOT from inside the
# Hermes agent sandbox container) so the ports are reachable
# from your Windows browser.
#
#   cd /opt/data/hermes-dashboard
#   ./run.sh            # build + start full stack (nginx+frontend+adapter)
#   ./run.sh stop       # stop the stack
#   ./run.sh logs       # tail logs
#   ./run.sh local      # no-docker mode (adapter + next dev)
#
# Then open:  http://localhost:8080/projects
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
export HERMES_HOME="${HERMES_HOME:-/opt/data}"

cmd="${1:-up}"

case "$cmd" in
  up|start)
    echo "▶ Building & starting Hermes Dashboard (nginx :8080, frontend :3800, adapter :3801)…"
    docker compose up -d --build
    echo
    echo "✅ Dashboard:  http://localhost:8080/projects"
    echo "   (from another machine on your LAN: http://<this-host-ip>:8080/projects)"
    echo "   API health:  http://localhost:8080/projects/api/health"
    ;;

  stop|down)
    docker compose down
    echo "⏹  Stopped."
    ;;

  logs)
    docker compose logs -f --tail=100
    ;;

  restart)
    docker compose restart
    ;;

  local)
    # No-Docker fallback: run the adapter + Next dev server directly on the host.
    echo "▶ Local mode (no Docker)."
    echo "  Starting adapter on :3801 …"
    ( cd backend && HERMES_HOME="$HERMES_HOME" python3 hermes_adapter.py --port 3801 --host 0.0.0.0 ) &
    ADAPTER_PID=$!
    trap "kill $ADAPTER_PID 2>/dev/null || true" EXIT
    echo "  Starting Next.js dev on :3800 …"
    cd frontend
    [ -d node_modules ] || npm install
    # In dev, Next rewrites /projects/api/* → adapter (see next.config.mjs)
    NEXT_PUBLIC_HERMES_API="http://localhost:3801" npm run dev
    ;;

  *)
    echo "Usage: ./run.sh [up|stop|logs|restart|local]"
    exit 1
    ;;
esac
