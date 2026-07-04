import cron from 'node-cron';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { buildDailySummary } from '../lib/summary.js';
import { sendWxMessage } from '../push/wxpusher.js';

interface WorkspaceRow {
  id: string;
  morning_time: string;
  evening_time: string;
  timezone: string;
}

interface UserRow {
  wxpusher_uid: string | null;
}

function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

function currentTimeInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function getWorkspaceUids(workspaceId: string): string[] {
  const users = db
    .prepare('SELECT wxpusher_uid FROM users WHERE workspace_id = ?')
    .all(workspaceId) as unknown as UserRow[];
  return users.map((u) => u.wxpusher_uid).filter((uid): uid is string => Boolean(uid));
}

function tryLogPush(workspaceId: string, pushType: string, pushDate: string): boolean {
  try {
    db.prepare('INSERT INTO push_log (id, workspace_id, push_type, push_date) VALUES (?, ?, ?, ?)').run(
      nanoid(),
      workspaceId,
      pushType,
      pushDate,
    );
    return true;
  } catch {
    return false;
  }
}

async function checkMorningReminders() {
  const workspaces = db.prepare('SELECT id, morning_time, timezone FROM workspaces').all() as unknown as Pick<
    WorkspaceRow,
    'id' | 'morning_time' | 'timezone'
  >[];

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
  const today = todayInTimezone('Asia/Shanghai');

  for (const ws of workspaces) {
    const now = currentTimeInTimezone(ws.timezone);
    if (now !== ws.morning_time) continue;
    if (!tryLogPush(ws.id, 'morning', today)) continue;

    const uids = getWorkspaceUids(ws.id);
    await sendWxMessage(
      uids,
      `【日程提醒】早安！请录入今日待办\n\n👉 打开：${baseUrl}`,
      '日程提醒：请录入今日待办',
    );
  }
}

async function checkEveningSummaries() {
  const workspaces = db.prepare('SELECT id, evening_time, timezone FROM workspaces').all() as unknown as Pick<
    WorkspaceRow,
    'id' | 'evening_time' | 'timezone'
  >[];

  for (const ws of workspaces) {
    const now = currentTimeInTimezone(ws.timezone);
    if (now !== ws.evening_time) continue;

    const today = todayInTimezone(ws.timezone);
    if (!tryLogPush(ws.id, 'evening', today)) continue;

    const uids = getWorkspaceUids(ws.id);
    const summary = buildDailySummary(ws.id, today);
    await sendWxMessage(uids, summary, `今日进展 ${today}`);
  }
}

export function startScheduler() {
  cron.schedule('* * * * *', () => {
    void checkMorningReminders();
    void checkEveningSummaries();
  });
  console.log('[scheduler] started (every minute)');
}
