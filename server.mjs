import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { applyRoomAction, createRoomState } from "./room-engine.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4175);
const host = process.env.HOST || "127.0.0.1";
const rooms = new Map();
const clients = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8"
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/healthz") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.method === "GET" && url.pathname.match(/^\/api\/rooms\/[^/]+\/events$/)) {
    const code = roomCodeFromPath(url.pathname);
    return openEvents(code, response);
  }

  if (request.method === "POST" && url.pathname.match(/^\/api\/rooms\/[^/]+\/actions$/)) {
    const code = roomCodeFromPath(url.pathname);
    const body = await readJson(request);
    const room = getRoom(code);
    rooms.set(code, applyRoomAction(room, body));
    broadcast(code);
    response.writeHead(204);
    response.end();
    return;
  }

  serveStatic(url.pathname, response);
});

server.listen(port, host, () => {
  console.log(`Fish office server running at http://${host}:${port}/`);
});

setInterval(() => {
  for (const [code, room] of rooms.entries()) {
    rooms.set(code, applyRoomAction(room, { type: "tick" }));
    broadcast(code);
  }
}, 1000);

function getRoom(code) {
  if (!rooms.has(code)) {
    rooms.set(code, createRoomState(code));
  }
  return rooms.get(code);
}

function openEvents(code, response) {
  const room = getRoom(code);
  response.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  response.write(`data: ${JSON.stringify(room)}\n\n`);

  const roomClients = clients.get(code) || new Set();
  roomClients.add(response);
  clients.set(code, roomClients);

  response.on("close", () => {
    roomClients.delete(response);
  });
}

function broadcast(code) {
  const room = rooms.get(code);
  const roomClients = clients.get(code);
  if (!room || !roomClients) {
    return;
  }
  const payload = `data: ${JSON.stringify(room)}\n\n`;
  for (const client of roomClients) {
    client.write(payload);
  }
}

function roomCodeFromPath(pathname) {
  return decodeURIComponent(pathname.split("/")[3] || "FISH-404").toUpperCase();
}

function readJson(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(pathname, response) {
  const safePath = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);
  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}
