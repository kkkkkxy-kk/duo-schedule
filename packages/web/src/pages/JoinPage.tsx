import { useState } from 'react';
import { api, setToken } from '../api/client';

interface Props {
  onAuthed: () => void;
}

export default function JoinPage({ onAuthed }: Props) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [result, setResult] = useState<{ inviteCode: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data =
        mode === 'create'
          ? await api.createWorkspace(nickname)
          : await api.joinWorkspace(inviteCode, nickname);
      setToken(data.token);
      if (mode === 'create') {
        if (!data.inviteCode) {
          const me = await api.me();
          setResult({ inviteCode: me.workspace.inviteCode });
        } else {
          setResult({ inviteCode: data.inviteCode });
        }
      } else onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="page-bg flex flex-col items-center justify-center px-6">
        <div className="glass-card w-full max-w-sm p-8">
          <h1 className="text-center text-xl font-bold text-brand-700">工作区已创建</h1>
          <p className="mt-4 text-center text-sm text-slate-600">请将邀请码发给搭档：</p>
          <div className="invite-box mt-4 text-3xl font-bold tracking-widest text-brand-600">
            {result.inviteCode || '加载中…'}
          </div>
          {result.inviteCode && (
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(result.inviteCode)}
              className="btn-ghost mt-3 w-full py-2 text-sm text-accent-500"
            >
              复制邀请码
            </button>
          )}
          <button type="button" onClick={onAuthed} className="btn-primary mt-6 w-full py-3">
            进入日程
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg flex flex-col px-6 py-12 safe-bottom">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-brand-700">双人日程</h1>
        <p className="mt-2 text-center text-sm text-accent-500/80">两人一起记录、完成、互相鼓励</p>

        <div className="glass-card mt-8 flex p-1">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              mode === 'create' ? 'chip-active' : 'chip-inactive'
            }`}
          >
            创建工作区
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              mode === 'join' ? 'chip-active' : 'chip-inactive'
            }`}
          >
            加入工作区
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass-card mt-6 space-y-4 p-6">
          {mode === 'join' && (
            <div>
              <label className="text-sm font-medium text-brand-700/80">邀请码</label>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="6 位邀请码"
                maxLength={6}
                className="glass-input mt-1 w-full px-4 py-3 text-lg tracking-widest"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-brand-700/80">你的昵称</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例如：小明"
              className="glass-input mt-1 w-full px-4 py-3"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? '处理中...' : mode === 'create' ? '创建工作区' : '加入'}
          </button>
        </form>
      </div>
    </div>
  );
}
