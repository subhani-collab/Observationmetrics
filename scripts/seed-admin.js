#!/usr/bin/env node
/**
 * Run this to create/reset the admin user:
 *   node scripts/seed-admin.js
 */

require('dotenv').config({ path: '.env.local' });

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'dashboard.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const email = process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.INITIAL_ADMIN_PASSWORD;
const name = process.env.INITIAL_ADMIN_NAME || 'Admin';

if (!email || !password) {
  console.error('❌  Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env.local first.');
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
  );
`);

const hash = bcrypt.hashSync(password, 12);

try {
  db.prepare('DELETE FROM users WHERE email = ?').run(email.toLowerCase().trim());
  db.prepare('INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), email.toLowerCase().trim(), name, hash, 'admin'
  );
  console.log(`✅  Admin user created: ${email}`);
  console.log(`    Password: ${password}`);
} catch (err) {
  console.error('❌  Failed:', err.message);
}

db.close();
