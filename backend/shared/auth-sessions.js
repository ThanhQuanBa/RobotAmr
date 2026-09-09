const { randomBytes } = require('crypto');
const sessions = new Map();
const maxAge = 6 * 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, sameSite: 'lax', path: '/' };
function tokenFrom(req) {
  return req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('campus_session='))?.slice('campus_session='.length);
}
function issueSession(req, res, user) {
  const profile = { id: user.id, username: user.username, role: user.role };
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { user: profile, expires: Date.now() + maxAge });
  res.cookie('campus_session', token, { ...cookieOptions, maxAge, secure: req.headers['x-forwarded-proto'] === 'https' });
  return profile;
}
function readSession(req) {
  const entry = sessions.get(tokenFrom(req));
  return entry && entry.expires > Date.now() ? entry.user : null;
}
function clearSession(req, res) {
  sessions.delete(tokenFrom(req));
  res.clearCookie('campus_session', cookieOptions);
}
setInterval(() => {
  for (const [token, entry] of sessions) if (entry.expires <= Date.now()) sessions.delete(token);
}, 60000).unref();
module.exports = { issueSession, readSession, clearSession };
