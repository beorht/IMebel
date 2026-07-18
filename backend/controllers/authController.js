import bcrypt from 'bcrypt';
import { createUser, findUserByUsername } from '../db.js';

const SALT_ROUNDS = 10;

function setSessionCookie(res, userId) {
  res.cookie('uid', String(userId), {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
  });
}

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      const err = new Error('Username and password are required');
      err.status = 400;
      return next(err);
    }

    if (findUserByUsername(username)) {
      const err = new Error('Username already taken');
      err.status = 409;
      return next(err);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser(username, passwordHash);

    setSessionCookie(res, user.id);
    res.status(201).json({ success: true, username: user.username });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      const err = new Error('Username and password are required');
      err.status = 400;
      return next(err);
    }

    const user = findUserByUsername(username);
    if (!user) {
      const err = new Error('Invalid username or password');
      err.status = 401;
      return next(err);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      const err = new Error('Invalid username or password');
      err.status = 401;
      return next(err);
    }

    setSessionCookie(res, user.id);
    res.json({ success: true, username: user.username });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('uid');
  res.json({ success: true });
}
