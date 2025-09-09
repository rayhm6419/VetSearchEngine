export type Role = 'system' | 'user' | 'assistant';

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number; // epoch ms
};

export type ChatContext = {
  zip?: string;
  type?: string;
  radius?: number;
};

export type ChatEvent =
  | { type: 'token'; value: string }
  | { type: 'done' }
  | { type: 'error'; error: string };

export type StreamHandle = {
  onToken: (cb: (token: string) => void) => void;
  onDone: (cb: () => void) => void;
  onError: (cb: (err: string) => void) => void;
  cancel: () => void;
};


