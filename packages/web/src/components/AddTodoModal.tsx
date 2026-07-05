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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/15 p-4 backdrop-blur-sm safe-bottom">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-lg p-5 shadow-glass-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-brand-700">添加我的待办</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="今天要做什么？"
          rows={3}
          className="glass-input mt-3 w-full resize-none px-4 py-3"
          autoFocus
        />
        <div className="mt-3 flex gap-2">
          {[
            { v: 'high', l: '高', c: 'border-brand-300 bg-brand-50/80 text-brand-600' },
            { v: 'medium', l: '中', c: 'border-accent-300 bg-accent-50/80 text-accent-500' },
            { v: 'low', l: '低', c: 'border-white/70 bg-white/50 text-slate-500' },
          ].map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPriority(p.v)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium backdrop-blur-sm ${
                priority === p.v ? p.c : 'border-white/50 text-slate-400'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 text-slate-600">
            取消
          </button>
          <button type="submit" className="btn-primary flex-1 py-3">
            添加
          </button>
        </div>
      </form>
    </div>
  );
}
