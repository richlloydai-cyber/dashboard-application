#!/usr/bin/env python3
"""Tiny reverse proxy: /projects/api/* -> adapter(3801), everything else -> frontend(3821).
Single entrypoint so one cloudflared tunnel serves the whole dashboard."""
import http.server, socketserver, urllib.request, urllib.error, sys

FRONTEND = "http://127.0.0.1:3821"
ADAPTER  = "http://127.0.0.1:3801"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3822

HOP = {"connection","keep-alive","proxy-authenticate","proxy-authorization",
       "te","trailers","transfer-encoding","upgrade","content-length"}

class Proxy(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *a): pass

    def _route(self):
        p = self.path
        if p.startswith("/projects/api/"):
            return ADAPTER + p[len("/projects/api"):]  # strip prefix for adapter
        if p == "/" :
            return FRONTEND + "/projects"
        return FRONTEND + p

    def _proxy(self, method):
        target = self._route()
        body = None
        cl = self.headers.get("Content-Length")
        if cl: body = self.rfile.read(int(cl))
        req = urllib.request.Request(target, data=body, method=method)
        for k, v in self.headers.items():
            if k.lower() not in HOP and k.lower() != "host":
                req.add_header(k, v)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                self.send_response(r.status)
                for k, v in r.headers.items():
                    if k.lower() not in HOP:
                        self.send_header(k, v)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            for k, v in e.headers.items():
                if k.lower() not in HOP:
                    self.send_header(k, v)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            msg = f"proxy error: {e}".encode()
            self.send_response(502)
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def do_GET(self):    self._proxy("GET")
    def do_POST(self):   self._proxy("POST")
    def do_PUT(self):    self._proxy("PUT")
    def do_DELETE(self): self._proxy("DELETE")

class TS(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == "__main__":
    print(f"[proxy] serving on 0.0.0.0:{PORT}  (/projects/api -> {ADAPTER}, else -> {FRONTEND})", flush=True)
    TS(("0.0.0.0", PORT), Proxy).serve_forever()
