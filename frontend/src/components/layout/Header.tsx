"use client";

// ============================================================
// HERMES DASHBOARD - TOP HEADER / TITLE BAR
// Primary color #4187ad (primary-500) corporate title bar
// ============================================================

import { Menu, Bell, RefreshCw, Circle, Search, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore, useWsConnected, useTimeRange } from "@/lib/store";
import type { TimeRange } from "@/types";

const TIME_RANGES: TimeRange[] = ["1h", "6h", "24h", "7d", "30d", "90d"];

export function Header({ dataSource = "loading" }: { dataSource?: "live" | "error" | "loading" }) {
  const setSidebarOpen = useProjectStore((s) => s.setSidebarOpen);
  const sidebarOpen = useProjectStore((s) => s.ui.sidebarOpen);
  const wsConnected = useWsConnected();
  const timeRange = useTimeRange();
  const setTimeRange = useProjectStore((s) => s.setTimeRange);
  const selectedProject = useProjectStore((s) => s.selectedProject);

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 bg-primary-500 text-white shadow-md lg:left-72">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left: menu toggle + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 font-bold">
              H
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">
                Hermes Project Control
              </h1>
              <p className="hidden text-xs text-white/70 sm:block">
                {selectedProject ? selectedProject.displayName : "All projects"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: search, time range, status, actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              placeholder="Search projects…"
              className="h-9 w-40 rounded-lg border border-white/20 bg-white/10 pl-8 pr-3 text-sm text-white placeholder:text-white/60 focus:w-56 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 lg:w-56"
            />
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="h-9 rounded-lg border border-white/20 bg-white/10 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Time range"
          >
            {TIME_RANGES.map((r) => (
              <option key={r} value={r} className="text-text-primary">
                {r}
              </option>
            ))}
          </select>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
              dataSource === "live" ? "bg-success-500/20" : dataSource === "error" ? "bg-danger-500/20" : "bg-white/10"
            )}
            title={
              dataSource === "live"
                ? "Serving live Hermes project data"
                : dataSource === "error"
                  ? "Live adapter unreachable — no data"
                  : "Loading…"
            }
          >
            <span className="hidden sm:inline">
              {dataSource === "live" ? "Live data" : dataSource === "error" ? "No live data" : "…"}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs"
            title={wsConnected ? "Live connection active" : "Disconnected"}
          >
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                wsConnected ? "text-success-300 animate-pulse-soft" : "text-danger-300"
              )}
            />
            <span className="hidden sm:inline">{wsConnected ? "Live" : "Offline"}</span>
          </div>

          <button
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10"
            aria-label="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-400 ring-2 ring-primary-500" />
          </button>

          {/* Login link */}
          <a
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10"
            aria-label="Login"
          >
            <LogIn className="h-4 w-4 inline mr-1.5" />
            <span className="hidden sm:inline">Login</span>
          </a>
        </div>
      </div>
    </header>
  );
}