import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { generateInviteCode, signToken } from '../lib/auth.js';
import { authHook } from '../lib/hooks.js';

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { nickname: string } }>('/auth/create', async (req) => {
    const nickname = req.body.nickname?.trim();
    if (!nickname) throw Object.assign(new Error('请输入昵称'), { statusCode: 400 });

    const workspaceId = nanoid();
    let inviteCode = generateInviteCode();
    while (db.prepare('SELECT id FROM workspaces WHERE invite_code = ?').get(inviteCode)) {
      inviteCode = generateInviteCode();
    }

    const userId = nanoid();
    db.prepare('INSERT INTO workspaces (id, invite_code) VALUES (?, ?)').run(workspaceId, inviteCode);
    db.prepare('INSERT INTO users (id, workspace_id, nickname) VALUES (?, ?, ?)').run(
      userId,
      workspaceId,
      nickname,
    );

    const token = signToken({ userId, workspaceId });
    return { token, inviteCode, userId, workspaceId, nickname };
  });

  app.post<{ Body: { inviteCode: string; nickname: string } }>('/auth/join', async (req) => {
    const inviteCode = req.body.inviteCode?.trim().toUpperCase();
    const nickname = req.body.nickname?.trim();
    if (!inviteCode || !nickname) {
      throw Object.assign(new Error('请输入邀请码和昵称'), { statusCode: 400 });
    }

    const workspace = db
      .prepare('SELECT id FROM workspaces WHERE invite_code = ?')
      .get(inviteCode) as { id: string } | undefined;
    if (!workspace) throw Object.assign(new Error('邀请码无效'), { statusCode: 404 });

    const existingUser = db
      .prepare('SELECT id FROM users WHERE workspace_id = ? AND nickname = ?')
      .get(workspace.id, nickname) as { id: string } | undefined;
    if (existingUser) {
      const token = signToken({ userId: existingUser.id, workspaceId: workspace.id });
      return { token, inviteCode, userId: existingUser.id, workspaceId: workspace.id, nickname };
    }

    const memberCount = db
      .prepare('SELECT COUNT(*) as c FROM users WHERE workspace_id = ?')
      .get(workspace.id) as { c: number };
    if (memberCount.c >= 2) {
      throw Object.assign(new Error('工作区已满（最多2人）'), { statusCode: 400 });
    }

    const userId = nanoid();
    db.prepare('INSERT INTO users (id, workspace_id, nickname) VALUES (?, ?, ?)').run(
      userId,
      workspace.id,
      nickname,
    );

    const token = signToken({ userId, workspaceId: workspace.id });
    return { token, inviteCode, userId, workspaceId: workspace.id, nickname };
  });
}

export async function meRoutes(app: FastifyInstance) {
  app.get('/auth/me', { preHandler: authHook }, async (req) => {
    const user = db
      .prepare('SELECT id, nickname, workspace_id, wxpusher_uid FROM users WHERE id = ?')
      .get(req.user!.userId) as {
      id: string;
      nickname: string;
      workspace_id: string;
      wxpusher_uid: string | null;
    };

    const workspace = db
      .prepare('SELECT invite_code, morning_time, evening_time, timezone FROM workspaces WHERE id = ?')
      .get(user.workspace_id) as {
      invite_code: string;
      morning_time: string;
      evening_time: string;
      timezone: string;
    };

    const members = db
      .prepare('SELECT id, nickname FROM users WHERE workspace_id = ? ORDER BY created_at')
      .all(user.workspace_id) as { id: string; nickname: string }[];

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        wxpusherUid: user.wxpusher_uid,
      },
      workspace: {
        id: user.workspace_id,
        inviteCode: workspace.invite_code,
        morningTime: workspace.morning_time,
        eveningTime: workspace.evening_time,
        timezone: workspace.timezone,
        members,
      },
    };
  });
}
