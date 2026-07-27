import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let __dirname_db;
try {
  const __filename_db = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_db = path.dirname(__filename_db);
} catch (err) {
  __dirname_db = process.cwd();
}

const dataDir = path.resolve(__dirname_db, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'imebel.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    images_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const insertUserStmt = db.prepare(
  'INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at'
);
const findUserByUsernameStmt = db.prepare(
  'SELECT id, username, password_hash AS passwordHash FROM users WHERE username = ?'
);
const findUserByIdStmt = db.prepare(
  'SELECT id, username FROM users WHERE id = ?'
);
const insertGenerationStmt = db.prepare(
  'INSERT INTO generations (user_id, prompt, images_json) VALUES (?, ?, ?)'
);

export function createUser(username, passwordHash) {
  const result = insertUserStmt.get(username, passwordHash);
  return { id: result.id, username: result.username, createdAt: result.created_at };
}

export function findUserByUsername(username) {
  return findUserByUsernameStmt.get(username);
}

export function findUserById(id) {
  return findUserByIdStmt.get(id);
}

export function insertGeneration(userId, prompt, imagesJson) {
  insertGenerationStmt.run(userId, prompt, imagesJson);
}

export default db;
