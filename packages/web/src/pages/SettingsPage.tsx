import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, clearToken } from '../api/client';
import type { SettingsResponse } from '../types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [nickname, setNickname] = useState('');
  const [wxpusherUid, setWxpusherUid] = useState('');
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('21:00');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      setNickname(s.nickname);
      setWxpusherUid(s.wxpusherUid ?? '');
      setMorningTime(s.morningTime);
      setEveningTime(s.eveningTime);
    });
  }, []);

  async function handleSave() {
    await api.updateSettings({ nickname, wxpusherUid, morningTime, eveningTime });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    clearToken();
    window.location.href = '/join';
  }

  if (!settings) {
    return (
      <div className="page-bg flex min-h-dvh items-center justify-center text-brand-600/60">加载中...</div>
    );
  }

  return (
    <div className="page-bg px-4 py-6 safe-bottom">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="text-brand-400">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-brand-700">设置</h1>
        </div>

        <div className="space-y-4">
          <section className="glass-card p-5">
            <h2 className="font-semibold text-brand-700">工作区</h2>
            <p className="mt-2 text-sm text-slate-500">邀请码（发给搭档）</p>
            <div className="invite-box mt-1 text-2xl font-bold tracking-widest text-brand-600">
              {settings.inviteCode}
            </div>
            <div className="mt-4 space-y-2">
              {settings.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span>{m.nickname}</span>
                  <span className={m.hasWxPusher ? 'text-accent-500' : 'text-slate-400'}>
                    {m.hasWxPusher ? '已绑定微信推送' : '未绑定推送'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-5">
            <h2 className="font-semibold text-brand-700">个人信息</h2>
            <label className="mt-4 block text-sm text-brand-700/70">昵称</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="glass-input mt-1 w-full px-4 py-2.5"
            />
          </section>

          <section className="glass-card p-5">
            <h2 className="font-semibold text-brand-700">微信推送（WxPusher）</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              1. 打开{' '}
              <a href="https://wxpusher.zjiecode.com" target="_blank" rel="noreferrer" className="text-accent-500">
                wxpusher.zjiecode.com
              </a>
              <br />
              2. 扫码关注应用，复制 UID 粘贴到下方
            </p>
            <label className="mt-4 block text-sm text-brand-700/70">WxPusher UID</label>
            <input
              value={wxpusherUid}
              onChange={(e) => setWxpusherUid(e.target.value)}
              placeholder="UID_xxxxxxxx"
              className="glass-input mt-1 w-full px-4 py-2.5"
            />
          </section>

          <section className="glass-card p-5">
            <h2 className="font-semibold text-brand-700">推送时间</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-brand-700/70">早上提醒</label>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="glass-input mt-1 w-full px-3 py-2.5"
                />
              </div>
              <div>
                <label className="text-sm text-brand-700/70">晚上进展</label>
                <input
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="glass-input mt-1 w-full px-3 py-2.5"
                />
              </div>
            </div>
          </section>

          <button type="button" onClick={() => void handleSave()} className="btn-primary w-full py-3.5 font-semibold">
            {saved ? '已保存 ✓' : '保存设置'}
          </button>

          <button type="button" onClick={handleLogout} className="btn-ghost w-full py-3 text-slate-500">
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
