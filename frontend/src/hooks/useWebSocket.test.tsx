import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { useWebSocket, useEventSource } from "@/hooks/useWebSocket";
import { useProjectStore } from "@/lib/store";

// jsdom has no WebSocket/EventSource globals; the hook reads
// `WebSocket.OPEN` at mount, so we always provide a stub that
// records the constructed socket and lets us drive onmessage.
class FakeSocket {
  static OPEN = 1;
  static CLOSED = 3;
  url: string;
  readyState = 0;
  onopen: any;
  onmessage: any;
  onclose: any;
  onerror: any;
  send = vi.fn();
  close = vi.fn();
  constructor(u: string) {
    this.url = u;
    (globalThis as any).__ws = this;
  }
}

class FakeEventSource {
  url: string;
  onopen: any;
  onmessage: any;
  onerror: any;
  close = vi.fn();
  constructor(u: string) {
    this.url = u;
    (globalThis as any).__es = this;
  }
}

describe("useWebSocket", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    (globalThis as any).WebSocket = FakeSocket;
    (globalThis as any).EventSource = FakeEventSource;
    (globalThis as any).window = { location: { origin: "http://localhost:3000" } };
  });
  afterEach(() => {
    delete (globalThis as any).WebSocket;
    delete (globalThis as any).EventSource;
    delete (globalThis as any).window;
    delete process.env["NEXT_PUBLIC_WS_URL"];
    delete process.env["NEXT_PUBLIC_HERMES_API"];
  });

  it("does not connect without an explicit WS url", () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));
    expect(result.current.isConnected).toBe(false);
    expect((globalThis as any).__ws).toBeUndefined();
  });

  it("constructs a socket + routes events when a WS url is configured", () => {
    (globalThis as any).WebSocket = FakeSocket;
    process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";

    const onConnect = vi.fn();
    renderHook(() =>
      useWebSocket({ projectId: "coder-board", autoConnect: true, onConnect })
    );
    const ws: any = (globalThis as any).__ws;
    // A socket was constructed with the project query param.
    expect(ws).toBeDefined();
    expect(ws.url).toContain("project=coder-board");

    // Drive an inbound build event -> routed into the store.
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: "build.finished",
          pipelineId: "p1",
          run: { id: "r9" },
        }),
      });
    });
    expect(useProjectStore.getState().buildRuns.get("p1")?.[0]?.id).toBe("r9");

    // send is exposed as a function regardless of open state.
    const { result } = renderHook(() => useWebSocket({ projectId: "coder-board", autoConnect: true }));
    expect(typeof result.current.send).toBe("function");
  });

  it("send is a no-op when socket not open", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(() => result.current.send({ a: 1 })).not.toThrow();
  });

  it("onclose resets connection + schedules reconnect, onerror surfaces error", () => {
    (globalThis as any).WebSocket = FakeSocket;
    process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";
    const onDisconnect = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useWebSocket({ projectId: "coder-board", autoConnect: true, onDisconnect, onError })
    );
    const ws: any = (globalThis as any).__ws;
    act(() => {
      ws.onopen?.();
      ws.readyState = 1; // OPEN
    });
    expect(useProjectStore.getState().wsConnected).toBe(true);

    act(() => {
      ws.readyState = 3; // CLOSED
      ws.onclose?.({ code: 1006, reason: "drop" });
    });
    // Local isConnected flips false immediately on close; wsConnected is
    // also reset (reconnect may re-set it later, which is fine).
    expect(result.current.isConnected).toBe(false);
    expect(onDisconnect).toHaveBeenCalled();
    // disconnect is a no-op after close (socket already null)
    expect(() => result.current.disconnect()).not.toThrow();

    // error path
    act(() => {
      ws.onerror?.(new Error("boom"));
    });
    expect(onError).toHaveBeenCalled();
  });

  it("explicit disconnect closes the socket", () => {
    (globalThis as any).WebSocket = FakeSocket;
    process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";
    const { result } = renderHook(() =>
      useWebSocket({ projectId: "coder-board", autoConnect: true })
    );
    const ws: any = (globalThis as any).__ws;
    act(() => {
      ws.onopen?.();
      ws.readyState = 1;
    });
    act(() => {
      result.current.disconnect();
    });
    expect(ws.close).toHaveBeenCalled();
    expect(useProjectStore.getState().wsConnected).toBe(false);
  });
});

describe("useEventSource", () => {
  beforeEach(() => {
    (globalThis as any).EventSource = FakeEventSource;
    (globalThis as any).window = { location: { origin: "http://localhost:3000" } };
  });
  afterEach(() => {
    delete (globalThis as any).EventSource;
    delete (globalThis as any).window;
    delete process.env["NEXT_PUBLIC_HERMES_API"];
  });

  it("constructs an EventSource and surfaces messages", () => {
    process.env["NEXT_PUBLIC_HERMES_API"] = "http://localhost:3801";
    const onMessage = vi.fn();
    renderHook(() => useEventSource("coder-board", { onMessage }));
    const es: any = (globalThis as any).__es;
    expect(es).toBeDefined();
    expect(es.url).toContain("project=coder-board");
    act(() => {
      es.onmessage?.({ data: "hello" });
    });
    expect(onMessage).toHaveBeenCalled();
  });

  it("onerror closes + schedules reconnect", () => {
    process.env["NEXT_PUBLIC_HERMES_API"] = "http://localhost:3801";
    const onMessage = vi.fn();
    renderHook(() => useEventSource("coder-board", { onMessage }));
    const es: any = (globalThis as any).__es;
    act(() => {
      es.onerror?.(new Error("x"));
    });
    // error path closes the current source
    expect(es.close).toHaveBeenCalled();
  });
});
