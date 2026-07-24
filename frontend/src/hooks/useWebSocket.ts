// ============================================================
// HERMES DASHBOARD - WEBSOCKET HOOK
// Real-time updates via WebSocket connection to Hermes backend
// ============================================================

import { useEffect, useRef, useCallback, useState } from "react";
import { useProjectStore } from "@/lib/store";
import type { DashboardEvent } from "@/types";

interface UseWebSocketOptions {
  projectId?: string | undefined;
  autoConnect?: boolean | undefined;
  onConnect?: (() => void) | undefined;
  onDisconnect?: (() => void) | undefined;
  onError?: ((error: Event) => void) | undefined;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: (message: unknown) => void;
  lastEvent: DashboardEvent | null;
  connectionError: Event | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    projectId,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const setWsConnected = useProjectStore((state) => state.setWsConnected);
  const updateBuildRun = useProjectStore((state) => state.updateBuildRun);
  const updateQualityRun = useProjectStore((state) => state.updateQualityRun);
  const updateDeployment = useProjectStore((state) => state.updateDeployment);
  const updateAgentTask = useProjectStore((state) => state.updateAgentTask);
  const updateAgentStatus = useProjectStore((state) => state.updateAgentStatus);

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<DashboardEvent | null>(null);
  const [connectionError, setConnectionError] = useState<Event | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  const handleEvent = useCallback((event: DashboardEvent) => {
    setLastEvent(event);

    // Route events to appropriate store updates
    switch (event.type) {
      // Build events
      case "build.started":
      case "build.finished":
      case "build.stage_changed":
      case "build.job_changed":
        if (event.run) {
          // We need the pipeline ID to update the build run
          // For now, store by run ID and project ID
          updateBuildRun(event.pipelineId, event.run);
        }
        break;

      // Quality events
      case "quality.started":
      case "quality.finished":
      case "quality.rule_changed":
        if (event.run) {
          updateQualityRun(event.gateId, event.run);
        }
        break;

      // Deployment events
      case "deployment.started":
      case "deployment.finished":
      case "deployment.step_changed":
      case "deployment.health_check":
        if (event.deployment) {
          updateDeployment(event.deployment);
        }
        break;

      // Agent events
      case "agent.task_started":
      case "agent.task_updated":
      case "agent.task_finished":
        if (event.task) {
          updateAgentTask(event.projectId, event.task);
        }
        break;

      case "agent.status_changed":
        if (event.agent) {
          updateAgentStatus(event.projectId, event.agent);
        }
        break;
    }
  }, [
    updateBuildRun,
    updateQualityRun,
    updateDeployment,
    updateAgentTask,
    updateAgentStatus,
  ]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = new URL(
      process.env['NEXT_PUBLIC_WS_URL'] || "/projects/ws",
      window.location.origin
    );
    if (projectId) {
      wsUrl.searchParams.set("project", projectId);
    }

    try {
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setWsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: DashboardEvent = JSON.parse(event.data);
          handleEvent(message);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Disconnected:", event.code, event.reason);
        setIsConnected(false);
        setWsConnected(false);
        onDisconnect?.();

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("[WebSocket] Max reconnect attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        setConnectionError(error);
        onError?.(error);
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
      setConnectionError(error as Event);
    }
  }, [projectId, handleEvent, onConnect, onDisconnect, onError, setWsConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
    setWsConnected(false);
    reconnectAttempts.current = maxReconnectAttempts; // Prevent reconnection
  }, [setWsConnected]);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when projectId changes
  useEffect(() => {
    if (isConnected && projectId) {
      disconnect();
      connect();
    }
  }, [projectId, isConnected, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    send,
    lastEvent,
    connectionError,
  };
}

// Hook for SSE (Server-Sent Events) as alternative
export function useEventSource(
  projectId?: string,
  options: { autoConnect?: boolean; onMessage?: (event: MessageEvent) => void } = {}
) {
  const { autoConnect = true, onMessage } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) return;

    const url = new URL(
      `${process.env['NEXT_PUBLIC_HERMES_API'] || "/projects/api"}/events`,
      window.location.origin
    );
    if (projectId) url.searchParams.set("project", projectId);

    const es = new EventSource(url.toString());
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("[SSE] Connected");
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      setLastEvent(event);
      onMessage?.(event);
    };

    es.onerror = (error) => {
      console.error("[SSE] Error:", error);
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;

      // Reconnect after delay
      setTimeout(() => connect(), 5000);
    };
  }, [projectId, onMessage]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { isConnected, connect, disconnect, lastEvent };
}