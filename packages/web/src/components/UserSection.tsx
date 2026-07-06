import type { Todo } from '../types';
import TodoItemRow from './TodoItemRow';

interface Props {
  userId: string;
  nickname: string;
  todos: Todo[];
  currentUserId: string;
  editable: boolean;
  onUpdate: (id: string, body: { status?: string; highlight?: string }) => void;
  onLike: (id: string, liked: boolean) => void;
  onHighlight: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function UserSection({
  userId,
  nickname,
  todos,
  currentUserId,
  editable,
  onUpdate,
  onLike,
  onHighlight,
  onDelete,
}: Props) {
  const doneCount = todos.filter((t) => t.status !== 'pending').length;
  const total = todos.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isMe = userId === currentUserId;

  return (
    <section className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-lg shadow-sm">
            {isMe ? '🙋' : '👤'}
          </span>
          <div>
            <h2 className="font-semibold text-brand-700">
              {nickname}
              {isMe && <span className="ml-1 text-xs font-normal text-accent-400">（我）</span>}
            </h2>
            <p className="text-xs text-slate-500">
              {doneCount}/{total} 完成
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-accent-500">{pct}%</span>
      </div>

      <div className="progress-track mb-4">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {todos.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">暂无待办</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItemRow
              key={todo.id}
              todo={todo}
              editable={editable}
              onUpdate={onUpdate}
              onLike={onLike}
              onHighlight={onHighlight}
              onDelete={isMe ? onDelete : undefined}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
