import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { buildDailySummary } from '../lib/summary.js';
import { authHook } from '../lib/hooks.js';

function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}

export async function workspaceRoutes(app: FastifyInstance) {
  const guard = { preHandler: authHook };

  app.get('/workspace/settings', guard, async (req) => {
    const { workspaceId, userId } = req.user!;

    const workspace = db
      .prepare('SELECT invite_code, morning_time, evening_time, timezone FROM workspaces WHERE id = ?')
      .get(workspaceId) as {
      invite_code: string;
      morning_time: string;
      evening_time: string;
      timezone: string;
    };

    const user = db
      .prepare('SELECT nickname, wxpusher_uid FROM users WHERE id = ?')
      .get(userId) as { nickname: string; wxpusher_uid: string | null };

    const members = db
      .prepare('SELECT id, nickname, wxpusher_uid FROM users WHERE workspace_id = ? ORDER BY created_at')
      .all(workspaceId) as { id: string; nickname: string; wxpusher_uid: string | null }[];

    return {
      inviteCode: workspace.invite_code,
      morningTime: workspace.morning_time,
      eveningTime: workspace.evening_time,
      timezone: workspace.timezone,
      nickname: user.nickname,
      wxpusherUid: user.wxpusher_uid,
      members: members.map((m) => ({
        id: m.id,
        nickname: m.nickname,
        hasWxPusher: Boolean(m.wxpusher_uid),
      })),
    };
  });

  app.patch<{
    Body: {
      nickname?: string;
      wxpusherUid?: string;
      morningTime?: string;
      eveningTime?: string;
    };
  }>('/workspace/settings', guard, async (req) => {
    const { workspaceId, userId } = req.user!;
    const { nickname, wxpusherUid, morningTime, eveningTime } = req.body;

    if (nickname?.trim()) {
      db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname.trim(), userId);
    }

    if (wxpusherUid !== undefined) {
      db.prepare('UPDATE users SET wxpusher_uid = ? WHERE id = ?').run(wxpusherUid.trim() || null, userId);
    }

    if (morningTime) {
      db.prepare('UPDATE workspaces SET morning_time = ? WHERE id = ?').run(morningTime, workspaceId);
    }

    if (eveningTime) {
      db.prepare('UPDATE workspaces SET evening_time = ? WHERE id = ?').run(eveningTime, workspaceId);
    }

    return { ok: true };
  });

  app.get<{ Querystring: { date?: string } }>('/summary', guard, async (req) => {
    const { workspaceId } = req.user!;
    const date = req.query.date ?? todayStr();
    return { text: buildDailySummary(workspaceId, date) };
  });
}
