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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/15 p-4 backdrop-blur-sm safe-bottom">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-lg p-5 shadow-glass-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-brand-700">亮点完成</h3>
        <p className="mt-1 text-sm text-accent-500/80">记录一下这次完成的特别之处</p>
        <textarea
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder="例如：刷新了个人记录"
          rows={3}
          className="glass-input mt-3 w-full resize-none px-4 py-3"
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 text-slate-600">
            取消
          </button>
          <button type="submit" className="btn-primary flex-1 py-3">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
