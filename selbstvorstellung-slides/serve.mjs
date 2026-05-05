import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { spawnSync } from "node:child_process";

const root = path.dirname(url.fileURLToPath(import.meta.url));
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT) || 8765;
const watch =
  process.argv.includes("--watch") ||
  process.argv.includes("-w") ||
  process.env.WATCH === "1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const livereloadClients = new Set();

const LR_SCRIPT = `
<script>
(function () {
  var es = new EventSource("/__livereload");
  es.onmessage = function () { location.reload(); };
  es.onerror = function () { es.close(); };
})();
</script>
`;

function safePath(requestPath) {
  const raw = (requestPath ?? "/").split("?")[0] || "/";
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  if (rel.includes("\0")) return null;
  const abs = path.resolve(root, rel);
  const rootResolved = path.resolve(root);
  if (!abs.startsWith(rootResolved + path.sep) && abs !== rootResolved) return null;
  return abs;
}

function runBuild() {
  const r = spawnSync(process.execPath, ["build.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || "[watch] build failed");
    return false;
  }
  console.error("[watch] index.html rebuilt");
  return true;
}

function injectLiveReload(html) {
  const i = html.lastIndexOf("</body>");
  if (i === -1) return html + LR_SCRIPT;
  return html.slice(0, i) + LR_SCRIPT + html.slice(i);
}

function broadcastReload() {
  for (const res of livereloadClients) {
    try {
      res.write("data: reload\n\n");
    } catch {
      livereloadClients.delete(res);
    }
  }
}

function startFsWatch() {
  let debounce = null;

  const schedule = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = null;
      if (runBuild()) broadcastReload();
    }, 220);
  };

  const onWatchEvent = (_evt, filename) => {
    if (filename && /~$|\.swp$|\.tmp$/i.test(String(filename))) return;
    schedule();
  };

  const slides = path.join(root, "src", "slides");
  const assetsDir = path.join(root, "assets");
  if (fs.existsSync(slides)) {
    try {
      fs.watch(slides, { recursive: true }, onWatchEvent);
    } catch (e) {
      console.error("[watch] slides:", e.message);
    }
  }
  if (fs.existsSync(assetsDir)) {
    try {
      fs.watch(assetsDir, { recursive: true }, onWatchEvent);
    } catch (e) {
      console.error("[watch] assets:", e.message);
    }
  }

  for (const f of [path.join(root, "build.mjs")]) {
    if (fs.existsSync(f)) fs.watch(f, onWatchEvent);
  }

  console.error("[watch] Live reload on — edit slides, assets, or build.mjs");
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url ?? "/", `http://${host}:${port}`);

  if (watch && u.pathname === "/__livereload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("retry: 2000\n\n");
    livereloadClients.add(res);
    req.on("close", () => livereloadClients.delete(res));
    return;
  }

  const abs = safePath(req.url ?? "/");
  if (!abs) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(abs, (err, data) => {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(abs).toLowerCase();
    let body = data;
    if (
      watch &&
      ext === ".html" &&
      path.basename(abs) === "index.html"
    ) {
      body = Buffer.from(injectLiveReload(data.toString("utf8")), "utf8");
    }
    res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
    res.writeHead(200).end(body);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is in use. Stop the other server or run: PORT=8877 npm run serve`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.error(`Deck: http://${host}:${port}/index.html`);
  if (watch) {
    runBuild();
    startFsWatch();
  }
});
