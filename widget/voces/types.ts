export interface Comment {
  id: string;
  author: string;
  avatarSeed: string; // Used to generate deterministic random avatars
  content: string;
  timestamp: number;
  isAdmin?: boolean;
}

export interface UserSession {
  username: string;
  avatarSeed: string;
}

export enum ViewState {
  HIDDEN = 'HIDDEN',
  COLLAPSED = 'COLLAPSED',
  EXPANDED = 'EXPANDED'
}