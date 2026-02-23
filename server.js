const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const CACHEABLE_EXTENSIONS = new Set(['.js', '.css', '.png', '.svg', '.ico']);

function safePathFromUrl(urlPath) {
  const cleanPath = decodeURIComponent(String(urlPath || '/').split('?')[0]);
  if (cleanPath === '/' || cleanPath === '') return path.join(process.cwd(), 'index.html');
  const resolved = path.resolve(process.cwd(), `.${cleanPath}`);
  if (!resolved.startsWith(process.cwd())) return null;
  return resolved;
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function buildHeaders(ext) {
  return {
    'content-type': MIME_TYPES[ext] || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
    'cache-control': CACHEABLE_EXTENSIONS.has(ext)
      ? 'public, max-age=3600, immutable'
      : 'no-store',
  };
}

function createServer() {
  return http.createServer((req, res) => {
    const method = req.method || 'GET';

    if (!['GET', 'HEAD'].includes(method)) {
      return send(res, 405, { 'content-type': 'text/plain; charset=utf-8' }, 'Method not allowed');
    }

    if (req.url === '/healthz') {
      return send(
        res,
        200,
        { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
        JSON.stringify({ status: 'ok' })
      );
    }

    const filePath = safePathFromUrl(req.url || '/');
    if (!filePath) {
      return send(res, 400, { 'content-type': 'text/plain; charset=utf-8' }, 'Bad request');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return send(res, 404, { 'content-type': 'text/plain; charset=utf-8' }, 'Not found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const headers = buildHeaders(ext);

      if (method === 'HEAD') {
        return send(res, 200, headers, '');
      }

      const stream = fs.createReadStream(filePath);
      res.writeHead(200, headers);
      stream.pipe(res);
      stream.on('error', () => {
        if (!res.headersSent) {
          send(res, 500, { 'content-type': 'text/plain; charset=utf-8' }, 'Server error');
        } else {
          res.destroy();
        }
      });
    });
  });
}

if (require.main === module) {
  const PORT = Number(process.env.PORT || 8080);
  const HOST = process.env.HOST || '0.0.0.0';
  const server = createServer();
  server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`DiagIA server listening on http://${HOST}:${PORT}`);
  });
}

module.exports = { createServer, safePathFromUrl, buildHeaders };
