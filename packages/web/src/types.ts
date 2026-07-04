export type Priority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'done' | 'highlight';

export interface Todo {
  id: string;
  userId: string;
  date: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  highlight: string | null;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export interface Member {
  id: string;
  nickname: string;
}

export interface MeResponse {
  user: { id: string; nickname: string; wxpusherUid: string | null };
  workspace: {
    id: string;
    inviteCode: string;
    morningTime: string;
    eveningTime: string;
    timezone: string;
    members: Member[];
  };
}

export interface TodosResponse {
  date: string;
  members: Member[];
  todos: Todo[];
}

export interface SettingsResponse {
  inviteCode: string;
  morningTime: string;
  eveningTime: string;
  timezone: string;
  nickname: string;
  wxpusherUid: string | null;
  members: { id: string; nickname: string; hasWxPusher: boolean }[];
}
