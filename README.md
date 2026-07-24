# Hermes Dashboard

A corporate-style web dashboard for visualising the software projects managed by
a local **Hermes AI agent** — build pipelines, code quality gates, deployment
status, and live agent tasks — organised around a three-pillar framework
(**Integrate → Deliver → Operate**).

![status](https://img.shields.io/badge/status-scaffold-4187ad)

---

## Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  This repo (run locally)    │        │  Hermes adapter API          │
│  Next.js 15 + React 19 +    │  HTTPS │  (runs inside the Hermes     │
│  Tailwind dashboard         │ ─────► │   container, exposed via a   │
│  http://localhost:3000      │  CORS  │   cloudflared tunnel)        │
└─────────────────────────────┘        └──────────────────────────────┘
```

- **Frontend** (`frontend/`) — the dashboard you run locally.
- **Backend adapter** (`backend/hermes_adapter.py`) — a dependency-free Python
  server that reads Hermes' live Kanban boards + git/CI state and serves them as
  JSON. Runs wherever Hermes lives; exposed to your machine over a tunnel.
- **Deployment extras** (`nginx/`, `docker-compose.yml`) — optional; for running
  the whole stack behind nginx under a `/projects` subpath.

The frontend talks to the API purely over `NEXT_PUBLIC_API_URL`, so it doesn't
care whether that's a tunnel, a published port, or a same-origin nginx path.

---

## Quick start (local dev)

**Prerequisites:** Node 20+, and a running Hermes adapter URL (a
`https://xxx.trycloudflare.com` address — ask whoever runs the agent).

```bash
git clone https://github.com/richlloydai-cyber/dashboard-application.git
cd dashboard-application/frontend

cp .env.local.example .env.local
# edit .env.local → set NEXT_PUBLIC_API_URL to your tunnel URL

npm install
npm run dev
```

Open **http://localhost:3000**. If the API URL is reachable, the header shows a
**“Live data”** badge; otherwise it falls back to **“Sample data”** so the UI
still renders.

---

## The three pillars

| Pillar | What it shows | Components |
|--------|---------------|------------|
| **Integrate** | Active build pipelines & code quality gates | `BuildPipelinePanel`, `QualityGatePanel` |
| **Deliver** | Environments & deployment status | `DeploymentPanel` |
| **Operate** | Live Hermes agent tasks & activity | `AgentTaskPanel` |

Primary brand colour: **`#4187ad`** (title bar + section accents).

---

## Exposing the API

The dashboard needs the adapter reachable over the network. Options:

1. **Quick tunnel** (fastest, ephemeral URL) —
   `cloudflared tunnel --url http://127.0.0.1:3801`
2. **Named tunnel** (stable URL, needs a Cloudflare account + domain).
3. **Published port** on the host, if the adapter runs somewhere you control.

See [`backend/README`](backend/) notes for running the adapter.

---

## Optional: full stack behind nginx

```bash
docker compose up -d --build   # serves at http://localhost:8080/projects
```

This runs nginx + frontend + adapter together under the `/projects` subpath
(set `NEXT_PUBLIC_DASHBOARD_PATH=/projects`). Not needed for local dev.

---

## Tech

Next.js 15 (App Router) · React 19 · Tailwind CSS · Zustand · Recharts ·
lucide-react · Python stdlib (adapter, zero deps).
