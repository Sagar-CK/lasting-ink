// Serve the viewer without installing the extension, for development and
// README screenshots. Annotations live in memory and vanish on reload.
//
//   npm run demo -- path/to/file.pdf [port]
//   open "http://localhost:8765/?scene=reader"
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const extension = path.resolve(here, "../../extension");
const [pdfPath, port = "8765"] = process.argv.slice(2);
if (!pdfPath) {
  console.error("Usage: npm run demo -- path/to/file.pdf [port]");
  process.exit(1);
}
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".pdf": "application/pdf",
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      if (url.pathname === "/") {
        res.writeHead(302, {
          location: `/viewer.html?local=demo.pdf&name=${encodeURIComponent(path.basename(pdfPath))}&${url.searchParams}`,
        });
        return res.end();
      }
      let file;
      if (url.pathname === "/demo.pdf") file = path.resolve(pdfPath);
      else if (url.pathname.startsWith("/demo/"))
        file = path.join(here, path.basename(url.pathname));
      else file = path.join(extension, path.normalize(url.pathname));
      if (
        !file.startsWith(extension) &&
        !file.startsWith(here) &&
        file !== path.resolve(pdfPath)
      )
        throw Object.assign(new Error("Forbidden"), { code: "ENOENT" });
      let body = await fs.readFile(file);
      if (url.pathname === "/viewer.html")
        body = String(body)
          .replace(
            '<script src="annotator.js">',
            '<script src="/demo/stub.js"></script><script src="annotator.js">',
          )
          .replace(
            "</body>",
            '<script type="module" src="/demo/scene.js"></script></body>',
          );
      res.writeHead(200, {
        "content-type": types[path.extname(file)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(Number(port), () =>
    console.log(`Lasting Ink demo: http://localhost:${port}/`),
  );
