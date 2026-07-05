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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-slate-100 px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-bold text-slate-800">工作区已创建</h1>
          <p className="mt-4 text-center text-slate-600">请将邀请码发给搭档：</p>
          <div className="mt-4 rounded-xl bg-brand-50 py-4 text-center text-3xl font-bold tracking-widest text-brand-600">
            {result.inviteCode || '加载中…'}
          </div>
          {result.inviteCode && (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(result.inviteCode);
              }}
              className="mt-3 w-full rounded-xl border border-brand-200 py-2 text-sm text-brand-600"
            >
              复制邀请码
            </button>
          )}
          <button
            type="button"
            onClick={onAuthed}
            className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-medium text-white active:bg-brand-700"
          >
            进入日程
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-50 to-slate-100 px-6 py-12 safe-bottom">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-slate-800">双人日程</h1>
        <p className="mt-2 text-center text-sm text-slate-500">两人一起记录、完成、互相鼓励</p>

        <div className="mt-8 flex rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'create' ? 'bg-brand-600 text-white' : 'text-slate-600'
            }`}
          >
            创建工作区
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'join' ? 'bg-brand-600 text-white' : 'text-slate-600'
            }`}
          >
            加入工作区
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-lg">
          {mode === 'join' && (
            <div>
              <label className="text-sm font-medium text-slate-700">邀请码</label>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="6 位邀请码"
                maxLength={6}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg tracking-widest outline-none focus:border-brand-500"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700">你的昵称</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例如：小明"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white active:bg-brand-700 disabled:opacity-50"
          >
            {loading ? '处理中...' : mode === 'create' ? '创建工作区' : '加入'}
          </button>
        </form>
      </div>
    </div>
  );
}
