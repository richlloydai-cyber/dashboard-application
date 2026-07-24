// ============================================================
// HERMES DASHBOARD - UTILITY FUNCTIONS
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString();
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: "text-success-600 bg-success-100",
    passed: "text-success-600 bg-success-100",
    failed: "text-danger-600 bg-danger-100",
    error: "text-danger-600 bg-danger-100",
    running: "text-primary-600 bg-primary-100",
    pending: "text-warning-600 bg-warning-100",
    queued: "text-warning-600 bg-warning-100",
    idle: "text-neutral-600 bg-neutral-100",
    cancelled: "text-neutral-600 bg-neutral-100",
    warning: "text-warning-600 bg-warning-100",
    partial: "text-warning-600 bg-warning-100",
    deploying: "text-primary-600 bg-primary-100",
    verifying: "text-primary-600 bg-primary-100",
    rolled_back: "text-danger-600 bg-danger-100",
    paused: "text-warning-600 bg-warning-100",
  };
  return colors[status] || "text-neutral-600 bg-neutral-100";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    success: "✓",
    passed: "✓",
    failed: "✕",
    error: "✕",
    running: "⟳",
    pending: "○",
    queued: "○",
    idle: "○",
    cancelled: "○",
    warning: "⚠",
    partial: "◐",
    deploying: "⟳",
    verifying: "⟳",
    rolled_back: "↶",
    paused: "⏸",
  };
  return icons[status] || "?";
}

export function getPillarColor(pillar: string): string {
  const colors: Record<string, string> = {
    build: "bg-blue-500",
    quality: "bg-green-500",
    deploy: "bg-purple-500",
    agent: "bg-orange-500",
  };
  return colors[pillar] || "bg-neutral-500";
}

export function getPillarTextColor(pillar: string): string {
  const colors: Record<string, string> = {
    build: "text-blue-600",
    quality: "text-green-600",
    deploy: "text-purple-600",
    agent: "text-orange-600",
  };
  return colors[pillar] || "text-neutral-600";
}

export function getPillarBgColor(pillar: string): string {
  const colors: Record<string, string> = {
    build: "bg-blue-50",
    quality: "bg-green-50",
    deploy: "bg-purple-50",
    agent: "bg-orange-50",
  };
  return colors[pillar] || "bg-neutral-50";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}…`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}