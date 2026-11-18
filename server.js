// MatchIQ Pro: tiny Node.js server.
// - serves the static website (index.html, contact.html, css, js, img)
// - POST /api/contact forwards the contact form to a Telegram bot
// The bot token stays here on the server (in .env) and never reaches the browser.
//
// Run locally:  npm start   (reads secrets from .env)
// On Render:    secrets come from the dashboard's Environment Variables.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// Load .env if it exists (local development). On Render there is no .env file.
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env: use real env vars */ }

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// One or more chat IDs, separated by commas: TELEGRAM_CHAT_ID=111,222
const CHAT_IDS = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim()).filter(Boolean);

// Websites allowed to call this API from the browser (CORS).
// The GitHub Pages site + local development.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://isabek27.github.io,http://localhost:3000')
  .split(',').map(o => o.trim()).filter(Boolean);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Files that must never be served to the browser.
const PRIVATE = ['.env', 'server.js', 'package.json', 'render.yaml'];

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10000) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// Server-side validation: the browser check can be bypassed, this one cannot.
function validate(data) {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) errors.push('name');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('email');
  if (!data.topic) errors.push('topic');
  if (!data.message || data.message.trim().length < 15) errors.push('message');
  return errors;
}

async function handleContact(req, res) {
  if (!BOT_TOKEN || !CHAT_IDS.length) {
    return sendJson(res, 500, { ok: false, error: 'Server is not configured (check .env)' });
  }

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { ok: false, error: 'Invalid request' });
  }

  const errors = validate(data);
  if (errors.length) {
    return sendJson(res, 400, { ok: false, error: 'Invalid fields: ' + errors.join(', ') });
  }

  const text =
    '📩 New message from MatchIQ Pro\n\n' +
    'Name: ' + data.name.trim() + '\n' +
    'Email: ' + data.email.trim() + '\n' +
    'Subject: ' + data.topic + '\n\n' +
    data.message.trim();

  // Send to every chat; the form succeeds if at least one chat got the message.
  const results = await Promise.all(CHAT_IDS.map(async chatId => {
    try {
      const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      });
      const result = await tg.json();
      if (!result.ok) console.error(`Telegram error for chat ${chatId}:`, result.description);
      return result.ok;
    } catch (err) {
      console.error(`Network error for chat ${chatId}:`, err.message);
      return false;
    }
  }));

  const sent = results.filter(Boolean).length;
  if (!sent) return sendJson(res, 502, { ok: false, error: 'Could not deliver the message to Telegram' });
  console.log(`Message from ${data.email} sent to ${sent}/${CHAT_IDS.length} chats`);
  sendJson(res, 200, { ok: true });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  // Block path traversal (../) and private files.
  if (!filePath.startsWith(ROOT) || PRIVATE.includes(path.basename(filePath))) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
}

http.createServer((req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'POST' && req.url === '/api/contact') return handleContact(req, res);
  if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, { ok: true });
  if (req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405);
  res.end('Method not allowed');
}).listen(PORT, () => {
  console.log(`MatchIQ Pro running at http://localhost:${PORT}`);
  if (!BOT_TOKEN || !CHAT_IDS.length) console.warn('Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env');
});
