// Public visitor test entry point. The internal gateway stays off the tunnel.
const express = require('express');
const path = require('path');
const { randomBytes } = require('crypto');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
const sessions = new Map();
const attempts = new Map();
const upstream = 'http://127.0.0.1:3000/api';
const maxAge = 6 * 60 * 60 * 1000;

function session(req) {
  const token = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('campus_test='))?.slice(12);
  const entry = sessions.get(token);
  if (entry && entry.expires > Date.now()) return entry;
  return null;
}
async function call(route, method = 'GET', body) {
  const response = await fetch(upstream + route, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(120000)
  });
  return { status: response.status, data: await response.json() };
}
app.use('/api', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const route = req.path;
  const auth = session(req);
  try {
    if (req.method === 'GET' && route === '/auth/session') {
      return res.json({ user: auth?.user || null });
    }
    if (req.method === 'POST') {
      // Reject cross-site writes; the tunnel supplies the public Host header.
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Origin not allowed' });
      const key = `${req.headers['cf-connecting-ip'] || req.ip}:${route}`;
      const now = Date.now();
      let counter = attempts.get(key);
      if (!counter || counter.until < now) { counter = { count: 0, until: now + 60000 }; attempts.set(key,counter); }
      if (++counter.count > (route === '/ai/ask' ? 8 : 15)) return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }
    if (req.method === 'GET' && route === '/tours/slots') {
      const result = await call(route); return res.status(result.status).json(result.data);
    }
    if (req.method === 'POST' && ['/auth/login', '/auth/register'].includes(route)) {
      const { username, password } = req.body;
      if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password || username.length > 100 || password.length > 200) return res.status(400).json({ error: 'Enter a valid username and password.' });
      const result = await call(route, 'POST', { username, password });
      if (result.data.success) {
        if (result.data.user?.role !== 'visitor') return res.status(403).json({ error: 'This test link only supports visitor accounts.' });
        const token = randomBytes(32).toString('hex');
        sessions.set(token, { user: result.data.user, expires: Date.now() + maxAge, id: token });
        res.cookie('campus_test', token, { httpOnly: true, sameSite: 'lax', secure: req.headers['x-forwarded-proto'] === 'https', maxAge });
      }
      return res.status(result.status).json(result.data);
    }
    if (!auth) return res.status(401).json({ error: 'Please sign in to use the test site.' });
    if (req.method === 'POST' && route === '/auth/logout') {
      sessions.delete(auth.id);
      res.clearCookie('campus_test', { httpOnly: true, sameSite: 'lax', path: '/' });
      return res.json({ success: true });
    }
    if (req.method === 'GET' && route === '/bookings') {
      const result = await call('/bookings?userId=' + encodeURIComponent(auth.user.id));
      return res.status(result.status).json(Array.isArray(result.data) ? result.data.filter(b => b.userId === auth.user.id) : result.data);
    }
    if (req.method === 'POST' && route === '/bookings') {
      const { visitorName, routeId, timeSlot } = req.body;
      if (![visitorName, routeId, timeSlot].every(v => typeof v === 'string' && v.trim() && v.length <= 150)) return res.status(400).json({ error: 'Please select a route, time, and visitor name.' });
      const result = await call(route, 'POST', { visitorName, routeId, timeSlot, userId: auth.user.id });
      return res.status(result.status).json(result.data);
    }
    if (req.method === 'POST' && route === '/ai/ask') {
      const { question, poiName, language } = req.body;
      if (typeof question !== 'string' || !question.trim() || question.length > 3000) return res.status(400).json({ error: 'Please enter a question under 3000 characters.' });
      const result = await call(route, 'POST', { question, poiName: typeof poiName === 'string' ? poiName.slice(0,100) : 'Main Hall', language: ['vi','en','ja','ko'].includes(language) ? language : 'vi', sessionId: 'public-' + auth.id });
      return res.status(result.status).json(result.data);
    }
    return res.status(403).json({ error: 'This action is not available on the visitor test link.' });
  } catch (error) {
    console.error('[Share server]', error.message);
    res.status(502).json({ error: 'The test server is temporarily unavailable. Please try again.' });
  }
});
const socketProxy = createProxyMiddleware({ target: 'http://127.0.0.1:3004', changeOrigin: true, ws: true });
app.use((req,res,next) => req.path.startsWith('/socket.io/') ? socketProxy(req,res,next) : next());
const dist = path.join(__dirname, '../frontend/dist');
app.use(express.static(dist, { index: false, setHeaders(res, file) {
  res.set('Cache-Control', file.endsWith('.html') ? 'no-store' : 'public, max-age=0, must-revalidate');
} }));
app.use('/assets', (req,res) => res.status(404).type('text').send('Asset not found. Please reload the page.'));
app.get('/{*path}', (req,res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(dist, 'index.html'));
});
app.use((err,req,res,next) => res.status(err.status || 500).json({ error: 'Invalid request.' }));
setInterval(() => {
  for (const [key,value] of sessions) if (value.expires < Date.now()) sessions.delete(key);
  for (const [key,value] of attempts) if (value.until < Date.now()) attempts.delete(key);
}, 60000).unref();
const server = app.listen(4173, '127.0.0.1', () => console.log('Visitor test server: http://127.0.0.1:4173'));
server.on('upgrade', (req,socket,head) => {
  if (req.url.startsWith('/socket.io/')) socketProxy.upgrade(req,socket,head);
  else socket.destroy();
});
