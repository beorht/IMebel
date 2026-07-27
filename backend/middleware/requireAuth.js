import { findUserById } from '../db.js';

function resolveUser(req) {
  const raw = req.signedCookies?.uid;
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) return null;
  return findUserById(id) || null;
}

export function requireAuth(req, res, next) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

export function attachUser(req, res, next) {
  res.locals.user = resolveUser(req);
  next();
}
