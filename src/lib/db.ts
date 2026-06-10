import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { Employee, SyncLog, User, EmployeeFilters, PaginatedResult, DashboardStats } from '@/types';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'dashboard.db');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    _db = new DatabaseSync(DB_PATH);
    _db.exec('PRAGMA journal_mode = WAL');
    _db.exec('PRAGMA foreign_keys = ON');
    _db.exec('PRAGMA synchronous = NORMAL');
    migrate(_db);
    seedAdmin(_db);
  }
  return _db;
}

function migrate(db: DatabaseSync) {
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

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      reporting_manager TEXT,
      onboarding_start_date TEXT,
      attendance TEXT,
      engagement TEXT,
      learning_comprehension TEXT,
      product_role_understanding INTEGER,
      communication_skills INTEGER,
      quiz_result TEXT,
      overall_performance_score INTEGER,
      final_notes TEXT,
      video_link TEXT,
      row_hash TEXT NOT NULL,
      sheet_row INTEGER,
      synced_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(reporting_manager);
    CREATE INDEX IF NOT EXISTS idx_employees_date ON employees(onboarding_start_date);
    CREATE INDEX IF NOT EXISTS idx_employees_score ON employees(overall_performance_score);
    CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      records_total INTEGER DEFAULT 0,
      records_added INTEGER DEFAULT 0,
      records_updated INTEGER DEFAULT 0,
      records_skipped INTEGER DEFAULT 0,
      error_message TEXT,
      triggered_by TEXT NOT NULL DEFAULT 'scheduler'
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedAdmin(db: DatabaseSync) {
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'subhani@fleetpanda.com').toLowerCase().trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'password';
  const name = process.env.INITIAL_ADMIN_NAME || 'Admin';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
  const hash = bcrypt.hashSync(password, 12);

  if (existing) {
    db.prepare('UPDATE users SET password_hash = ?, name = ? WHERE email = ?').run(hash, name, email);
  } else {
    db.prepare('INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), email, name, hash, 'admin'
    );
  }
}

// ── Employee queries ──────────────────────────────────────────────────────────

export function getEmployees(filters: EmployeeFilters = {}): PaginatedResult<Employee> {
  const db = getDb();
  const {
    search,
    manager,
    month,
    year,
    sortBy = 'onboarding_start_date',
    sortDir = 'desc',
    page = 1,
    pageSize = 25,
  } = filters;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push('(e.name LIKE ? OR e.title LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (manager) {
    conditions.push('e.reporting_manager = ?');
    params.push(manager);
  }
  if (year) {
    conditions.push("strftime('%Y', e.onboarding_start_date) = ?");
    params.push(year);
  }
  if (month) {
    conditions.push("strftime('%m', e.onboarding_start_date) = ?");
    params.push(month.padStart(2, '0'));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSorts = new Set(['overall_performance_score', 'attendance', 'onboarding_start_date', 'name']);
  const col = allowedSorts.has(sortBy) ? sortBy : 'onboarding_start_date';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM employees e ${where}`).get(...params) as { c: number }).c;
  const offset = (page - 1) * pageSize;

  const data = db.prepare(
    `SELECT e.* FROM employees e ${where} ORDER BY e.${col} ${dir} LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset) as Employee[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getEmployee(id: string): Employee | undefined {
  return getDb().prepare('SELECT * FROM employees WHERE id = ?').get(id) as Employee | undefined;
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const totalEmployees = (db.prepare('SELECT COUNT(*) as c FROM employees').get() as { c: number }).c;

  const perf = db.prepare(
    'SELECT AVG(overall_performance_score) as avg FROM employees WHERE overall_performance_score IS NOT NULL'
  ).get() as { avg: number | null };

  const atRisk = (db.prepare(
    'SELECT COUNT(*) as c FROM employees WHERE overall_performance_score IS NOT NULL AND overall_performance_score <= 2'
  ).get() as { c: number }).c;

  const onTrack = (db.prepare(
    'SELECT COUNT(*) as c FROM employees WHERE overall_performance_score IS NOT NULL AND overall_performance_score >= 4'
  ).get() as { c: number }).c;

  const managers = (db.prepare(
    "SELECT DISTINCT reporting_manager FROM employees WHERE reporting_manager IS NOT NULL AND reporting_manager != '' ORDER BY reporting_manager"
  ).all() as { reporting_manager: string }[]).map(r => r.reporting_manager);

  // Try to compute avg attendance from numeric attendance values
  const attendanceRows = db.prepare(
    "SELECT attendance FROM employees WHERE attendance IS NOT NULL AND attendance != ''"
  ).all() as { attendance: string }[];

  const numericAttendances = attendanceRows
    .map(r => parseFloat(r.attendance.replace('%', '')))
    .filter(n => !isNaN(n));

  const avgAttendance = numericAttendances.length
    ? numericAttendances.reduce((a, b) => a + b, 0) / numericAttendances.length
    : null;

  return {
    totalEmployees,
    avgPerformance: perf.avg !== null ? Math.round(perf.avg * 100) / 100 : null,
    avgAttendance: avgAttendance !== null ? Math.round(avgAttendance * 10) / 10 : null,
    atRiskCount: atRisk,
    onTrackCount: onTrack,
    managers,
  };
}

export function getDistinctYears(): string[] {
  return (getDb().prepare(
    "SELECT DISTINCT strftime('%Y', onboarding_start_date) as y FROM employees WHERE onboarding_start_date IS NOT NULL ORDER BY y DESC"
  ).all() as { y: string }[]).map(r => r.y).filter(Boolean);
}

export function upsertEmployee(data: Omit<Employee, 'created_at' | 'updated_at'>): 'inserted' | 'updated' | 'skipped' {
  const db = getDb();
  const existing = db.prepare('SELECT id, row_hash FROM employees WHERE id = ?').get(data.id) as { id: string; row_hash: string } | undefined;

  if (existing) {
    if (existing.row_hash === data.row_hash) return 'skipped';
    db.prepare(`
      UPDATE employees SET
        name=?, title=?, reporting_manager=?, onboarding_start_date=?,
        attendance=?, engagement=?, learning_comprehension=?,
        product_role_understanding=?, communication_skills=?, quiz_result=?,
        overall_performance_score=?, final_notes=?, video_link=?,
        row_hash=?, sheet_row=?, synced_at=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      data.name, data.title, data.reporting_manager, data.onboarding_start_date,
      data.attendance, data.engagement, data.learning_comprehension,
      data.product_role_understanding, data.communication_skills, data.quiz_result,
      data.overall_performance_score, data.final_notes, data.video_link,
      data.row_hash, data.sheet_row, data.synced_at, data.id
    );
    return 'updated';
  }

  db.prepare(`
    INSERT INTO employees (
      id, name, title, reporting_manager, onboarding_start_date,
      attendance, engagement, learning_comprehension,
      product_role_understanding, communication_skills, quiz_result,
      overall_performance_score, final_notes, video_link,
      row_hash, sheet_row, synced_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    data.id, data.name, data.title, data.reporting_manager, data.onboarding_start_date,
    data.attendance, data.engagement, data.learning_comprehension,
    data.product_role_understanding, data.communication_skills, data.quiz_result,
    data.overall_performance_score, data.final_notes, data.video_link,
    data.row_hash, data.sheet_row, data.synced_at
  );
  return 'inserted';
}

// ── Sync log queries ──────────────────────────────────────────────────────────

export function createSyncLog(triggeredBy: 'scheduler' | 'manual'): number {
  const result = getDb().prepare(
    "INSERT INTO sync_logs (started_at, triggered_by) VALUES (datetime('now'), ?)"
  ).run(triggeredBy);
  return result.lastInsertRowid as number;
}

export function completeSyncLog(
  id: number,
  status: 'success' | 'error',
  counts: { total: number; added: number; updated: number; skipped: number },
  errorMessage?: string
) {
  getDb().prepare(`
    UPDATE sync_logs SET
      completed_at=datetime('now'), status=?,
      records_total=?, records_added=?, records_updated=?, records_skipped=?,
      error_message=?
    WHERE id=?
  `).run(status, counts.total, counts.added, counts.updated, counts.skipped, errorMessage ?? null, id);
}

export function getSyncLogs(limit = 50): SyncLog[] {
  return getDb().prepare(
    'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT ?'
  ).all(limit) as SyncLog[];
}

export function getLastSuccessfulSync(): SyncLog | undefined {
  return getDb().prepare(
    "SELECT * FROM sync_logs WHERE status='success' ORDER BY completed_at DESC LIMIT 1"
  ).get() as SyncLog | undefined;
}

export function getCurrentSyncStatus(): SyncLog | undefined {
  return getDb().prepare(
    "SELECT * FROM sync_logs WHERE status='running' ORDER BY started_at DESC LIMIT 1"
  ).get() as SyncLog | undefined;
}

// ── Auth queries ──────────────────────────────────────────────────────────────

export function getUserByEmail(email: string): User & { password_hash: string } | undefined {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as (User & { password_hash: string }) | undefined;
}

export function updateLastLogin(id: string) {
  getDb().prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").run(id);
}

// ── Audit log ────────────────────────────────────────────────────────────────

export function addAuditLog(userEmail: string | null, action: string, details?: string, ipAddress?: string) {
  getDb().prepare(
    'INSERT INTO audit_logs (user_email, action, details, ip_address) VALUES (?,?,?,?)'
  ).run(userEmail, action, details ?? null, ipAddress ?? null);
}
