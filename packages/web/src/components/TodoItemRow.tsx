import { useEffect, useRef, useState } from 'react';
import type { Todo } from '../types';
import LikeButton from './LikeButton';

const PRIORITY_STYLE: Record<string, string> = {
  high: 'bg-brand-700 text-white border border-brand-800/40',
  medium: 'bg-brand-100/90 text-brand-600 border border-brand-200/60',
  low: 'bg-white/95 text-slate-500 border border-slate-200/70',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const LONG_PRESS_MS = 500;

interface Props {
  todo: Todo;
  editable: boolean;
  onUpdate: (id: string, body: { status?: string; highlight?: string }) => void;
  onLike: (id: string, liked: boolean) => void;
  onHighlight: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TodoItemRow({
  todo,
  editable,
  onUpdate,
  onLike,
  onHighlight,
  onDelete,
}: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const rowRef = useRef<HTMLLIElement>(null);
  const statusIcon = todo.status === 'highlight' ? '⭐' : todo.status === 'done' ? '✅' : '⬜';
  const canDelete = todo.isMine && editable && onDelete;
  const showLikes = todo.status === 'done' || todo.status === 'highlight';

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }

  function startLongPress() {
    if (!canDelete) return;
    clearTimer();
    timerRef.current = setTimeout(() => setShowDelete(true), LONG_PRESS_MS);
  }

  useEffect(() => {
    if (!showDelete) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setShowDelete(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [showDelete]);

  return (
    <li
      ref={rowRef}
      className={`rounded-xl border bg-white/40 backdrop-blur-sm transition ${
        showDelete ? 'border-red-200/80 bg-red-50/30' : 'border-white/60'
      }`}
      onTouchStart={startLongPress}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      onMouseDown={startLongPress}
      onMouseUp={clearTimer}
      onMouseLeave={clearTimer}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        {todo.isMine && editable ? (
          <button
            type="button"
            onClick={() => {
              if (todo.status === 'pending') onUpdate(todo.id, { status: 'done' });
              else onUpdate(todo.id, { status: 'pending' });
            }}
            className="mt-0.5 shrink-0 text-lg leading-none"
            aria-label="切换完成状态"
          >
            {statusIcon}
          </button>
        ) : (
          <span className="mt-0.5 shrink-0 text-lg leading-none">{statusIcon}</span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm leading-snug ${
                todo.status !== 'pending' ? 'text-slate-500 line-through' : 'text-brand-900/80'
              } ${todo.status === 'highlight' ? '!text-accent-600 !line-through-none' : ''}`}
            >
              {todo.description}
            </p>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${PRIORITY_STYLE[todo.priority]}`}>
              {PRIORITY_LABEL[todo.priority]}
            </span>
          </div>

          {todo.status === 'highlight' && todo.highlight && (
            <p className="mt-1 text-xs text-accent-600">✨ {todo.highlight}</p>
          )}

          {todo.isMine && editable && todo.status === 'done' && (
            <button type="button" onClick={() => onHighlight(todo.id)} className="mt-1 text-xs text-accent-500">
              标记为亮点完成
            </button>
          )}
        </div>

        {showLikes && todo.isMine && (
          <LikeButton liked={todo.likeCount > 0} count={todo.likeCount} readOnly />
        )}

        {showLikes && !todo.isMine && (
          <LikeButton
            liked={todo.likedByMe}
            count={todo.likeCount}
            onToggle={() => onLike(todo.id, todo.likedByMe)}
          />
        )}
      </div>

      {showDelete && (
        <div className="flex justify-end border-t border-red-100/80 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              onDelete!(todo.id);
              setShowDelete(false);
            }}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-medium text-white active:bg-red-600"
          >
            删除
          </button>
        </div>
      )}
    </li>
  );
}
