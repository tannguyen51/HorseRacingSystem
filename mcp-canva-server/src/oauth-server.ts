#!/usr/bin/env node

/**
 * Simple OAuth callback server for Canva.
 * Starts an HTTP server on the redirect URI port.
 * After authorizing in Canva, the browser redirects here, and this server
 * prints the authorization code for use with canva_authenticate.
 *
 * Usage: node dist/oauth-server.js
 */

import * as http from 'node:http';
import * as url from 'node:url';

const PORT = parseInt(process.env.CANVA_REDIRECT_PORT || '9876', 10);

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);
  const { code, state, error } = parsed.query;

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>Authorization Failed</h1><p>Error: ${error}</p>`);
    console.error(`Authorization error: ${error}`);
    server.close();
    return;
  }

  if (code) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      '<h1>Authorization Successful!</h1>' +
        '<p>You can close this window.</p>' +
        `<p style="font-family:monospace;background:#f0f0f0;padding:8px;word-break:break-all">Code: ${code}<br>State: ${state || 'none'}</p>`
    );
    console.log('\n✅ Authorization code received!\n');
    console.log(`Code:  ${code}`);
    if (state) console.log(`State: ${state}`);
    console.log('\nCopy the code above and use it with canva_authenticate.');
    server.close();
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🔐 OAuth callback server listening on http://localhost:${PORT}`);
  console.log('Waiting for Canva authorization redirect...\n');
});

server.on('close', () => {
  console.log('Server stopped.');
  process.exit(0);
});
