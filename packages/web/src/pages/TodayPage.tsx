import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AddTodoModal from '../components/AddTodoModal';
import HighlightModal from '../components/HighlightModal';
import PwaInstallBanner from '../components/PwaInstallBanner';
import UserSection from '../components/UserSection';
import { addDays, formatDateLabel, todayStr } from '../lib/date';
import type { Member, Todo } from '../types';

export default function TodayPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [filterMine, setFilterMine] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [highlightTodoId, setHighlightTodoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const isToday = selectedDate === todayStr();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const load = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const [me, data] = await Promise.all([api.me(), api.getTodos(date)]);
      setCurrentUserId(me.user.id);
      setMembers(data.members);
      setTodos(data.todos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(selectedDate);
  }, [selectedDate, load]);

  async function handleAdd(description: string, priority: string) {
    const todo = await api.createTodo(description, priority, selectedDate);
    setTodos((prev) => [...prev, todo]);
    showToast('已添加');
  }

  async function handleUpdate(id: string, body: { status?: string; highlight?: string }) {
    const updated = await api.updateTodo(id, body);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleLike(id: string, liked: boolean) {
    const prev = todos.find((t) => t.id === id)!;
    setTodos((list) =>
      list.map((t) =>
        t.id === id
          ? {
              ...t,
              likedByMe: !liked,
              likeCount: liked ? t.likeCount - 1 : t.likeCount + 1,
            }
          : t,
      ),
    );
    try {
      const result = liked ? await api.unlikeTodo(id) : await api.likeTodo(id);
      setTodos((list) =>
        list.map((t) =>
          t.id === id ? { ...t, likedByMe: result.likedByMe, likeCount: result.likeCount } : t,
        ),
      );
      if (!liked) showToast('已点赞 ❤️');
    } catch (err) {
      setTodos((list) =>
        list.map((t) =>
          t.id === id ? { ...t, likedByMe: prev.likedByMe, likeCount: prev.likeCount } : t,
        ),
      );
      showToast(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function copySummary() {
    const { text } = await api.getSummary(selectedDate);
    await navigator.clipboard.writeText(text);
    showToast('已复制，可粘贴到微信群');
  }

  const displayMembers = filterMine
    ? members.filter((m) => m.id === currentUserId)
    : members;

  if (loading && todos.length === 0 && members.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">加载中...</div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-100 pb-28">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <PwaInstallBanner />
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate((d) => addDays(d, -1))}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                aria-label="前一天"
              >
                ‹
              </button>
              <h1 className="text-lg font-bold text-slate-800">{formatDateLabel(selectedDate)}</h1>
              <button
                type="button"
                onClick={() => setSelectedDate((d) => addDays(d, 1))}
                disabled={selectedDate >= todayStr()}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                aria-label="后一天"
              >
                ›
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                max={todayStr()}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
              />
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr())}
                  className="text-xs text-brand-600"
                >
                  回到今日
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void copySummary()}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              复制群消息
            </button>
            <Link to="/settings" className="rounded-lg p-2 text-slate-500">
              ⚙️
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-lg px-4 pb-3">
          <button
            type="button"
            onClick={() => setFilterMine(false)}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              !filterMine ? 'bg-brand-600 text-white' : 'text-slate-500'
            }`}
          >
            双人视图
          </button>
          <button
            type="button"
            onClick={() => setFilterMine(true)}
            className={`ml-2 rounded-lg px-3 py-1 text-xs font-medium ${
              filterMine ? 'bg-brand-600 text-white' : 'text-slate-500'
            }`}
          >
            只看我的
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {displayMembers.map((member) => (
          <UserSection
            key={member.id}
            userId={member.id}
            nickname={member.nickname}
            todos={todos.filter((t) => t.userId === member.id)}
            currentUserId={currentUserId}
            editable={isToday}
            onUpdate={handleUpdate}
            onLike={handleLike}
            onHighlight={setHighlightTodoId}
          />
        ))}

        {members.length < 2 && isToday && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">等待搭档加入工作区</p>
            <Link to="/settings" className="mt-2 inline-block text-sm text-brand-600">
              查看邀请码 →
            </Link>
          </div>
        )}
      </main>

      {isToday && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur safe-bottom">
          <div className="mx-auto max-w-lg">
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full rounded-2xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 active:bg-brand-700"
            >
              ＋ 添加我的待办
            </button>
          </div>
        </div>
      )}

      <AddTodoModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />

      <HighlightModal
        open={highlightTodoId !== null}
        onClose={() => setHighlightTodoId(null)}
        onSubmit={(highlight) => {
          if (highlightTodoId) void handleUpdate(highlightTodoId, { status: 'highlight', highlight });
        }}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
