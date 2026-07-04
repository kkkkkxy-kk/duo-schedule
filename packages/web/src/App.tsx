import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api/client';
import JoinPage from './pages/JoinPage';
import TodayPage from './pages/TodayPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthed(false);
      return;
    }
    api
      .me()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        加载中...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/join" element={authed ? <Navigate to="/" replace /> : <JoinPage onAuthed={() => setAuthed(true)} />} />
      <Route path="/settings" element={authed ? <SettingsPage /> : <Navigate to="/join" replace />} />
      <Route path="/" element={authed ? <TodayPage /> : <Navigate to="/join" replace />} />
    </Routes>
  );
}
