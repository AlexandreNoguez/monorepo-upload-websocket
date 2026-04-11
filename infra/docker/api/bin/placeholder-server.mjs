import http from "node:http";

const port = Number(process.env.API_PORT || 3000);
const mode = process.env.APP_RUNTIME || "unknown";

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
};

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    return json(response, 200, {
      status: "ok",
      service: "api",
      mode,
      message: "API container is healthy"
    });
  }

  return json(response, 200, {
    service: "api",
    mode,
    message: "NestJS app not scaffolded yet. Phase 3 will replace this placeholder server.",
    path: request.url
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[api] placeholder server running on port ${port} in ${mode} mode`);
});
