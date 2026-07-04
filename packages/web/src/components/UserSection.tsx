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
}: Props) {
  const doneCount = todos.filter((t) => t.status !== 'pending').length;
  const total = todos.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isMe = userId === currentUserId;

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-lg">
            {isMe ? '🙋' : '👤'}
          </span>
          <div>
            <h2 className="font-semibold text-slate-800">
              {nickname}
              {isMe && <span className="ml-1 text-xs font-normal text-slate-400">（我）</span>}
            </h2>
            <p className="text-xs text-slate-500">
              {doneCount}/{total} 完成
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-brand-600">{pct}%</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
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
            />
          ))}
        </ul>
      )}
    </section>
  );
}
