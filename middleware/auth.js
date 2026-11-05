import jwt from 'jsonwebtoken';

function extractToken(req) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) continue;
      const name = part.slice(0, separatorIndex).trim();
      if (name === 'token') {
        return decodeURIComponent(part.slice(separatorIndex + 1).trim());
      }
    }
  }
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }
  return null;
}

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(
      token,
      process.env.BETTER_AUTH_SECRET || 'secret'
    );
    req.user = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
