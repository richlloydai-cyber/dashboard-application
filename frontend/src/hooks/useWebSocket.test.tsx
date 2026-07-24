import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket, useEventSource } from "@/hooks/useWebSocket";
import { useProjectStore } from "@/lib/store";

describe("useWebSocket", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    // Ensure no window.WebSocket by default.
    (globalThis as any).WebSocket = undefined;
    (globalThis as any).window = { location: { origin: "http://localhost:3000" } };
    (globalThis as any).EventSource = undefined;
  });
  afterEach(() => vi.restoreAllMocks());

  it("does not connect without an explicit WS url", () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));
    // No throw, wsConnected stays false (no socket opened).
    expect(result.current.isConnected).toBe(false);
  });

  it("opens a socket + routes events when a WS url is configured", () => {
    const fakeWs: any = {
      readyState: 0, send: vi.fn(), close: vi.fn(),
      onopen: null, onmessage: null, onclose: null, onerror: null,
    };
    class FakeSocket {
      static OPEN = 1;
      url: string;
      readyState = 0;
      onopen: any; onmessage: any; onclose: any; onerror: any;
      constructor(u: string) { this.url = u; (globalThis as any).__ws = this; }
      send = fakeWs.send;
      close = fakeWs.close;
    }
    (globalThis as any).WebSocket = FakeSocket;
    process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";

    const onConnect = vi.fn();
    const { result } = renderHook(() => useWebSocket({ projectId: "coder-board", autoConnect: true, onConnect }));
    const ws: any = (globalThis as any).__ws;
    act(() => { ws.onopen?.(); });
    expect(result.current.isConnected).toBe(true);
    expect(onConnect).toHaveBeenCalled();

    // Route a build event into the store.
    act(() => {
      ws.onmessage?.({ data: JSON.stringify({ type: "build.finished", pipelineId: "p1", run: { id: "r9" } }) });
    });
    expect(useProjectStore.getState().buildRuns.get("p1")?.[0]?.id).toBe("r9");

    act(() => { ws.onclose?.(); });
    expect(result.current.isConnected).toBe(false);
    delete process.env["NEXT_PUBLIC_WS_URL"];
  });

  it("send is a no-op when socket not open", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(() => result.current.send({ a: 1 })).not.toThrow();
  });
});

describe("useEventSource", () => {
  it("connects an EventSource and surfaces messages", () => {
    const fake: any = { onopen: null, onmessage: null, onerror: null, close: vi.fn() };
    class FakeES {
      url: string;
      onopen: any; onmessage: any; onerror: any;
      constructor(u: string) { this.url = u; (globalThis as any).__es = this; }
      close = fake.close;
    }
    (globalThis as any).EventSource = FakeES;
    process.env["NEXT_PUBLIC_HERMES_API"] = "http://localhost:3801";

    const onMessage = vi.fn();
    const { result } = renderHook(() => useEventSource("coder-board", { onMessage }));
    const es: any = (globalThis as any).__es;
    act(() => { es.onopen?.(); });
    expect(result.current.isConnected).toBe(true);
    act(() => { es.onmessage?.({ data: "hello" }); });
    expect(onMessage).toHaveBeenCalled();

    delete process.env["NEXT_PUBLIC_HERMES_API"];
  });
});
