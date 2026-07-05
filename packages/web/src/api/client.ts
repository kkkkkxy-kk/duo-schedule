// 开发环境走 Vite 代理 /api；生产环境 Docker 直连同域 API
const API_BASE = import.meta.env.DEV ? '/api' : '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? '请求失败');
  return data as T;
}

export const api = {
  createWorkspace: (nickname: string) =>
    request<{ token: string; inviteCode: string; nickname: string }>('/auth/create', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    }),

  joinWorkspace: (inviteCode: string, nickname: string) =>
    request<{ token: string; inviteCode: string; nickname: string }>('/auth/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode, nickname }),
    }),

  me: () => request<import('./types').MeResponse>('/auth/me'),

  getTodos: (date?: string) =>
    request<import('./types').TodosResponse>(`/todos${date ? `?date=${date}` : ''}`),

  createTodo: (description: string, priority: string, date?: string) =>
    request<import('./types').Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify({ description, priority, date }),
    }),

  updateTodo: (id: string, body: { status?: string; highlight?: string }) =>
    request<import('./types').Todo>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  likeTodo: (id: string) =>
    request<{ liked: boolean; likeCount: number; likedByMe: boolean }>(`/todos/${id}/like`, {
      method: 'POST',
    }),

  unlikeTodo: (id: string) =>
    request<{ liked: boolean; likeCount: number; likedByMe: boolean }>(`/todos/${id}/like`, {
      method: 'DELETE',
    }),

  getSettings: () => request<import('./types').SettingsResponse>('/workspace/settings'),

  updateSettings: (body: {
    nickname?: string;
    wxpusherUid?: string;
    morningTime?: string;
    eveningTime?: string;
  }) =>
    request<{ ok: boolean }>('/workspace/settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getSummary: (date?: string) =>
    request<{ text: string }>(`/summary${date ? `?date=${date}` : ''}`),
};
