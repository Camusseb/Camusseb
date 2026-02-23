const test = require('node:test');
const assert = require('node:assert/strict');

const { createServer, safePathFromUrl, buildHeaders } = require('../server');

test('safePathFromUrl blocks directory traversal', () => {
  assert.equal(safePathFromUrl('/../../etc/passwd'), null);
});

test('buildHeaders applies security and cache headers', () => {
  const headers = buildHeaders('.js');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.match(headers['content-security-policy'], /default-src 'self'/);
  assert.equal(headers['cache-control'], 'public, max-age=3600, immutable');
});

test('server responds to healthz and handles method restrictions', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  const payload = await health.json();
  assert.equal(payload.status, 'ok');

  const badMethod = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(badMethod.status, 405);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
