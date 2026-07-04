import { db } from '../db/index.js';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

interface TodoRow {
  description: string;
  priority: string;
  status: string;
  highlight: string | null;
  like_count: number;
}

interface UserRow {
  id: string;
  nickname: string;
}

function statusIcon(status: string): string {
  if (status === 'highlight') return '⭐';
  if (status === 'done') return '✅';
  return '⬜';
}

function formatTodoLine(todo: TodoRow): string {
  const icon = statusIcon(todo.status);
  const priority = `[${PRIORITY_LABEL[todo.priority] ?? todo.priority}]`;
  const likes = todo.like_count > 0 ? ` ❤️${todo.like_count}` : '';
  if (todo.status === 'highlight' && todo.highlight) {
    return `  ${icon} ${todo.description} — ${todo.highlight}${likes}`;
  }
  return `  ${icon} ${todo.description} ${priority}${likes}`;
}

export function buildDailySummary(workspaceId: string, date: string): string {
  const users = db
    .prepare('SELECT id, nickname FROM users WHERE workspace_id = ? ORDER BY created_at')
    .all(workspaceId) as unknown as UserRow[];

  const lines: string[] = [`【今日进展】${date}`, ''];

  for (const user of users) {
    const todos = db
      .prepare(`
        SELECT t.description, t.priority, t.status, t.highlight,
          (SELECT COUNT(*) FROM todo_likes WHERE todo_id = t.id) as like_count
        FROM todos t
        WHERE t.workspace_id = ? AND t.user_id = ? AND t.date = ?
        ORDER BY
          CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
          t.created_at
      `)
      .all(workspaceId, user.id, date) as unknown as TodoRow[];

    const doneCount = todos.filter((t) => t.status !== 'pending').length;
    lines.push(`👤 ${user.nickname} (${doneCount}/${todos.length} 完成)`);

    if (todos.length === 0) {
      lines.push('  （暂无待办）');
    } else {
      for (const todo of todos) {
        lines.push(formatTodoLine(todo));
      }
    }
    lines.push('');
  }

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
  lines.push(`👉 查看详情：${baseUrl}`);

  return lines.join('\n').trim();
}
