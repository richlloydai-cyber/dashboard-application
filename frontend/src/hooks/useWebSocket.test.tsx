import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWebSocket, useEventSource } from "@/hooks/useWebSocket";
import { useProjectStore } from "@/lib/store";

// jsdom has no WebSocket/EventSource globals; the hook reads
// `WebSocket.OPEN` at mount, so we always provide a stub.
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
    // No throw; wsConnected stays false (no socket opened).
    expect(result.current.isConnected).toBe(false);
    expect((globalThis as any).__ws).toBeUndefined();
  });

  it("opens a socket + routes events when a WS url is configured", async () => {
    (globalThis as any).WebSocket = FakeSocket;
    process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";

    const onConnect = vi.fn();
    const { result } = renderHook(() =>
      useWebSocket({ projectId: "coder-board", autoConnect: true, onConnect })
    );
    const ws: any = (globalThis as any).__ws;
    act(() => {
      ws.onopen?.();
    });
    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(onConnect).toHaveBeenCalled();

    // Route a build event into the store.
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

    act(() => {
      ws.onclose?.();
    });
    expect(result.current.isConnected).toBe(false);
  });

  it("send is a no-op when socket not open", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(() => result.current.send({ a: 1 })).not.toThrow();
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

  it("connects an EventSource and surfaces messages", () => {
    process.env["NEXT_PUBLIC_HERMES_API"] = "http://localhost:3801";
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useEventSource("coder-board", { onMessage })
    );
    const es: any = (globalThis as any).__es;
    act(() => {
      es.onopen?.();
    });
    expect(result.current.isConnected).toBe(true);
    act(() => {
      es.onmessage?.({ data: "hello" });
    });
    expect(onMessage).toHaveBeenCalled();
  });
});
