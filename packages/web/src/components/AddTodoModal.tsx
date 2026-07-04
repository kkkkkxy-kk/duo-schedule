import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (description: string, priority: string) => void;
}

export default function AddTodoModal({ open, onClose, onSubmit }: Props) {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description.trim(), priority);
    setDescription('');
    setPriority('medium');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 safe-bottom">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-800">添加我的待办</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="今天要做什么？"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          autoFocus
        />
        <div className="mt-3 flex gap-2">
          {[
            { v: 'high', l: '高', c: 'border-red-300 bg-red-50 text-red-600' },
            { v: 'medium', l: '中', c: 'border-amber-300 bg-amber-50 text-amber-700' },
            { v: 'low', l: '低', c: 'border-slate-300 bg-slate-50 text-slate-600' },
          ].map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPriority(p.v)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                priority === p.v ? p.c : 'border-slate-200 text-slate-400'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-slate-600"
          >
            取消
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white">
            添加
          </button>
        </div>
      </form>
    </div>
  );
}
