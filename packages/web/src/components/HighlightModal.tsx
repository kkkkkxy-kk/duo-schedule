import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (highlight: string) => void;
}

export default function HighlightModal({ open, onClose, onSubmit }: Props) {
  const [highlight, setHighlight] = useState('');

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!highlight.trim()) return;
    onSubmit(highlight.trim());
    setHighlight('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 safe-bottom">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-800">亮点完成</h3>
        <p className="mt-1 text-sm text-slate-500">记录一下这次完成的特别之处</p>
        <textarea
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder="例如：刷新了个人记录"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-slate-600"
          >
            取消
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-3 font-medium text-white">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
