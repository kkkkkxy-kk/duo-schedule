import type { DatabaseSync } from 'node:sqlite';

export function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      invite_code TEXT UNIQUE NOT NULL,
      morning_time TEXT NOT NULL DEFAULT '08:00',
      evening_time TEXT NOT NULL DEFAULT '21:00',
      timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id),
      nickname TEXT NOT NULL,
      wxpusher_uid TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'highlight')),
      highlight TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS todo_likes (
      id TEXT PRIMARY KEY,
      todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(todo_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS push_log (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      push_type TEXT NOT NULL,
      push_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(workspace_id, push_type, push_date)
    );

    CREATE INDEX IF NOT EXISTS idx_todos_workspace_date ON todos(workspace_id, date);
    CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);
  `);
}
