const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 8991);
const players = new Map();
const clients = new Set();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif"
};

const server = http.createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const safePath = path.normalize(rawPath === "/" ? "/index.html" : rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.resolve(root, "." + safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");

  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  socket.playerId = null;
  clients.add(socket);
  send(socket, { type: "snapshot", id: "server", players: Object.fromEntries(players) });

  socket.on("data", (buffer) => {
    for (const message of decodeFrames(buffer)) {
      handleMessage(socket, message);
    }
  });

  socket.on("close", () => removeClient(socket));
  socket.on("error", () => removeClient(socket));
});

function handleMessage(socket, text) {
  let message;
  try {
    message = JSON.parse(text);
  } catch {
    return;
  }

  if (message.type === "state" && message.player?.id) {
    socket.playerId = message.player.id;
    players.set(message.player.id, message.player);
    broadcast(message, socket);
    return;
  }

  if (message.type === "chat" && message.player?.id) {
    socket.playerId = message.player.id;
    players.set(message.player.id, message.player);
    broadcast(message, socket);
    return;
  }

  if (message.type === "leave" && message.id) {
    players.delete(message.id);
    broadcast(message, socket);
  }
}

function removeClient(socket) {
  clients.delete(socket);
  if (socket.playerId) {
    players.delete(socket.playerId);
    broadcast({ type: "leave", id: socket.playerId }, socket);
  }
}

function broadcast(message, except) {
  for (const client of clients) {
    if (client !== except && !client.destroyed) send(client, message);
  }
}

function send(socket, data) {
  const payload = Buffer.from(JSON.stringify(data));
  const header = payload.length < 126 ? Buffer.from([0x81, payload.length]) : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 255]);
  socket.write(Buffer.concat([header, payload]));
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;

  while (offset + 6 <= buffer.length) {
    const opcode = buffer[offset] & 0x0f;
    let length = buffer[offset + 1] & 0x7f;
    let cursor = offset + 2;

    if (length === 126) {
      length = buffer.readUInt16BE(cursor);
      cursor += 2;
    } else if (length === 127) {
      length = Number(buffer.readBigUInt64BE(cursor));
      cursor += 8;
    }

    const masked = (buffer[offset + 1] & 0x80) !== 0;
    const mask = masked ? buffer.subarray(cursor, cursor + 4) : null;
    cursor += masked ? 4 : 0;

    if (cursor + length > buffer.length) break;

    const payload = buffer.subarray(cursor, cursor + length);
    if (opcode === 0x8) break;
    if (opcode === 0x1) {
      const decoded = Buffer.alloc(length);
      for (let i = 0; i < length; i++) decoded[i] = masked ? payload[i] ^ mask[i % 4] : payload[i];
      messages.push(decoded.toString("utf8"));
    }

    offset = cursor + length;
  }

  return messages;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, player] of players) {
    if (now - player.time > 20000) {
      players.delete(id);
      broadcast({ type: "leave", id });
    }
  }
}, 5000);

server.listen(port, "0.0.0.0", () => {
  console.log(`Blingee Pixel multiplayer is running at http://localhost:${port}`);
  console.log(`People on the same Wi-Fi can join with your computer IP and port ${port}.`);
});
