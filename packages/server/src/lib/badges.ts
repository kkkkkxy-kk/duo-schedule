import { db } from '../db/index.js';

export interface UserBadge {
  completeDays: number;
  fullStars: number;
  filledTips: number;
}

function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}

/** 统计截止今天：有待办且全部完成的天数 → 每 5 天一颗满星 */
export function getBadgesForWorkspace(workspaceId: string): Map<string, UserBadge> {
  const today = todayStr();
  const rows = db
    .prepare(`
      SELECT user_id, date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM todos
      WHERE workspace_id = ? AND date <= ?
      GROUP BY user_id, date
      HAVING total > 0 AND pending_count = 0
    `)
    .all(workspaceId, today) as { user_id: string; date: string; total: number; pending_count: number }[];

  const dayCount = new Map<string, number>();
  for (const row of rows) {
    dayCount.set(row.user_id, (dayCount.get(row.user_id) ?? 0) + 1);
  }

  const members = db
    .prepare('SELECT id FROM users WHERE workspace_id = ?')
    .all(workspaceId) as { id: string }[];

  const result = new Map<string, UserBadge>();
  for (const m of members) {
    const completeDays = dayCount.get(m.id) ?? 0;
    result.set(m.id, {
      completeDays,
      fullStars: Math.floor(completeDays / 5),
      filledTips: completeDays % 5,
    });
  }
  return result;
}
