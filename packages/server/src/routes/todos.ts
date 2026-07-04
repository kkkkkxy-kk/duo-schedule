import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { sendWxMessage } from '../push/wxpusher.js';
import { authHook } from '../lib/hooks.js';

function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}

interface TodoRow {
  id: string;
  user_id: string;
  date: string;
  description: string;
  priority: string;
  status: string;
  highlight: string | null;
  like_count: number;
  liked_by_me: number;
}

function mapTodo(row: TodoRow, userId: string) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    description: row.description,
    priority: row.priority,
    status: row.status,
    highlight: row.highlight,
    likeCount: row.like_count,
    likedByMe: row.liked_by_me > 0,
    isMine: row.user_id === userId,
  };
}

export async function todoRoutes(app: FastifyInstance) {
  const guard = { preHandler: authHook };

  app.get<{ Querystring: { date?: string } }>('/todos', guard, async (req) => {
    const date = req.query.date ?? todayStr();
    const { userId, workspaceId } = req.user!;

    const members = db
      .prepare('SELECT id, nickname FROM users WHERE workspace_id = ? ORDER BY created_at')
      .all(workspaceId) as unknown as { id: string; nickname: string }[];

    const rows = db
      .prepare(`
        SELECT id, user_id, date, description, priority, status, highlight
        FROM todos
        WHERE workspace_id = ? AND date = ?
        ORDER BY user_id, CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created_at
      `)
      .all(workspaceId, date) as unknown as Omit<TodoRow, 'like_count' | 'liked_by_me'>[];

    const likes = db
      .prepare('SELECT todo_id, user_id FROM todo_likes WHERE todo_id IN (SELECT id FROM todos WHERE workspace_id = ? AND date = ?)')
      .all(workspaceId, date) as unknown as { todo_id: string; user_id: string }[];

    const likeMap = new Map<string, { count: number; likedByMe: boolean }>();
    for (const row of rows) {
      likeMap.set(row.id, { count: 0, likedByMe: false });
    }
    for (const like of likes) {
      const entry = likeMap.get(like.todo_id)!;
      entry.count += 1;
      if (like.user_id === userId) entry.likedByMe = true;
    }

    return {
      date,
      members,
      todos: rows.map((r) => ({
        ...mapTodo(
          {
            ...r,
            like_count: likeMap.get(r.id)?.count ?? 0,
            liked_by_me: likeMap.get(r.id)?.likedByMe ? 1 : 0,
          },
          userId,
        ),
      })),
    };
  });

  app.post<{ Body: { date?: string; description: string; priority: string } }>('/todos', guard, async (req) => {
    const { userId, workspaceId } = req.user!;
    const description = req.body.description?.trim();
    const priority = req.body.priority ?? 'medium';
    const date = req.body.date ?? todayStr();

    if (!description) throw Object.assign(new Error('请输入事项描述'), { statusCode: 400 });
    if (!['high', 'medium', 'low'].includes(priority)) {
      throw Object.assign(new Error('优先级无效'), { statusCode: 400 });
    }

    const id = nanoid();
    db.prepare(`
      INSERT INTO todos (id, workspace_id, user_id, date, description, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, workspaceId, userId, date, description, priority);

    const row = db
      .prepare(`
        SELECT t.id, t.user_id, t.date, t.description, t.priority, t.status, t.highlight,
          0 as like_count, 0 as liked_by_me
        FROM todos t WHERE t.id = ?
      `)
      .get(id) as unknown as TodoRow;

    return mapTodo(row, userId);
  });

  app.patch<{ Params: { id: string }; Body: { status?: string; highlight?: string } }>(
    '/todos/:id',
    guard,
    async (req) => {
      const { userId } = req.user!;
      const todo = db
        .prepare('SELECT id, user_id, status FROM todos WHERE id = ?')
        .get(req.params.id) as { id: string; user_id: string; status: string } | undefined;

      if (!todo) throw Object.assign(new Error('待办不存在'), { statusCode: 404 });
      if (todo.user_id !== userId) throw Object.assign(new Error('只能修改自己的待办'), { statusCode: 403 });

      const { status, highlight } = req.body;
      if (status && !['pending', 'done', 'highlight'].includes(status)) {
        throw Object.assign(new Error('状态无效'), { statusCode: 400 });
      }
      if (status === 'highlight' && !highlight?.trim()) {
        throw Object.assign(new Error('亮点完成需要填写亮点内容'), { statusCode: 400 });
      }

      const newStatus = status ?? todo.status;
      const newHighlight = status === 'highlight' ? highlight!.trim() : status === 'pending' ? null : undefined;

      if (newHighlight !== undefined) {
        db.prepare(`UPDATE todos SET status = ?, highlight = ?, updated_at = datetime('now') WHERE id = ?`).run(
          newStatus,
          newHighlight,
          todo.id,
        );
      } else {
        db.prepare(`UPDATE todos SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(newStatus, todo.id);
      }

      const row = db
        .prepare(`
          SELECT t.id, t.user_id, t.date, t.description, t.priority, t.status, t.highlight,
            (SELECT COUNT(*) FROM todo_likes WHERE todo_id = t.id) as like_count,
            (SELECT COUNT(*) FROM todo_likes WHERE todo_id = t.id AND user_id = ?) as liked_by_me
          FROM todos t WHERE t.id = ?
        `)
        .get(userId, todo.id) as unknown as TodoRow;

      return mapTodo(row, userId);
    },
  );

  app.post<{ Params: { id: string } }>('/todos/:id/like', guard, async (req) => {
    const { userId, workspaceId } = req.user!;
    const todo = db
      .prepare('SELECT id, user_id, description, status FROM todos WHERE id = ? AND workspace_id = ?')
      .get(req.params.id, workspaceId) as
      | { id: string; user_id: string; description: string; status: string }
      | undefined;

    if (!todo) throw Object.assign(new Error('待办不存在'), { statusCode: 404 });
    if (todo.user_id === userId) throw Object.assign(new Error('不能给自己的待办点赞'), { statusCode: 400 });
    if (!['done', 'highlight'].includes(todo.status)) {
      throw Object.assign(new Error('只能对已完成的待办点赞'), { statusCode: 400 });
    }

    try {
      db.prepare('INSERT INTO todo_likes (id, todo_id, user_id) VALUES (?, ?, ?)').run(
        nanoid(),
        todo.id,
        userId,
      );
    } catch {
      throw Object.assign(new Error('已经点过赞了'), { statusCode: 400 });
    }

    const liker = db.prepare('SELECT nickname, wxpusher_uid FROM users WHERE id = ?').get(userId) as {
      nickname: string;
      wxpusher_uid: string | null;
    };
    const owner = db.prepare('SELECT wxpusher_uid FROM users WHERE id = ?').get(todo.user_id) as {
      wxpusher_uid: string | null;
    };

    if (owner.wxpusher_uid) {
      const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
      void sendWxMessage(
        [owner.wxpusher_uid],
        `❤️ ${liker.nickname} 为你的「${todo.description}」点了赞\n\n👉 查看：${baseUrl}`,
        `${liker.nickname} 为你的待办点了赞`,
      );
    }

    return { liked: true, likeCount: getLikeCount(todo.id), likedByMe: true };
  });

  app.delete<{ Params: { id: string } }>('/todos/:id/like', guard, async (req) => {
    const { userId, workspaceId } = req.user!;
    const todo = db
      .prepare('SELECT id, user_id FROM todos WHERE id = ? AND workspace_id = ?')
      .get(req.params.id, workspaceId) as { id: string; user_id: string } | undefined;

    if (!todo) throw Object.assign(new Error('待办不存在'), { statusCode: 404 });

    const result = db.prepare('DELETE FROM todo_likes WHERE todo_id = ? AND user_id = ?').run(todo.id, userId);
    if (result.changes === 0) throw Object.assign(new Error('尚未点赞'), { statusCode: 400 });

    return { liked: false, likeCount: getLikeCount(todo.id), likedByMe: false };
  });
}

function getLikeCount(todoId: string): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM todo_likes WHERE todo_id = ?').get(todoId) as { c: number };
  return row.c;
}
