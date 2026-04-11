import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


MODE = os.getenv("APP_RUNTIME", "unknown")
PORT = int(os.getenv("FUNCTION_APP_PORT", "7071"))


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(
                200,
                {
                    "status": "ok",
                    "service": "image-processor-function",
                    "mode": MODE,
                    "message": "Function container is healthy",
                },
            )
            return

        self._send_json(
            200,
            {
                "service": "image-processor-function",
                "mode": MODE,
                "message": "Azure Function app not scaffolded yet. Phase 8 will replace this placeholder server.",
                "path": self.path,
            },
        )

    def log_message(self, format: str, *args) -> None:
        return


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(
        f"[image-processor-function] placeholder server running on port {PORT} in {MODE} mode"
    )
    server.serve_forever()
