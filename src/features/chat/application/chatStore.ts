"use client";

import { useEffect } from 'react';
import { create } from 'zustand';
import { Message, ChatContext } from '@/lib/chat/types';
import { startStream } from '@/lib/chat/mockClient';

type ChatState = {
  isOpen: boolean;
  isStreaming: boolean;
  unreadCount: number;
  messages: Message[];
  open: () => void;
  close: () => void;
  clear: () => void;
  send: (text: string, context?: ChatContext) => void;
  applySuggestion: (text: string, context?: ChatContext) => void;
  hydrate: (key: string) => void;
  persistKey?: string;
};

const genId = () => Math.random().toString(36).slice(2);

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  isStreaming: false,
  unreadCount: 0,
  messages: [],
  open: () => {
    console.log('chat_opened');
    set({ isOpen: true, unreadCount: 0 });
  },
  close: () => {
    console.log('chat_closed');
    set({ isOpen: false });
  },
  clear: () => set({ messages: [] }),
  send: (text, context) => {
    const state = get();
    const userMsg: Message = { id: genId(), role: 'user', content: text, createdAt: Date.now() };
    const assistantMsg: Message = { id: genId(), role: 'assistant', content: '', createdAt: Date.now() };
    const msgs: Message[] = [...state.messages, userMsg, assistantMsg];
    set({ messages: msgs, isStreaming: true });
    console.log('chat_sent');
    const handle = startStream({ messages: msgs, context });
    handle.onToken((t) => {
      set((s) => {
        const arr = [...s.messages];
        const lastIdx = arr.length - 1;
        arr[lastIdx] = { ...arr[lastIdx], content: arr[lastIdx].content + t };
        return { messages: arr };
      });
    });
    handle.onDone(() => {
      set((s) => ({ isStreaming: false, unreadCount: s.isOpen ? 0 : s.unreadCount + 1 }));
      console.log('chat_stream_done');
      const key = get().persistKey;
      if (key) localStorage.setItem(key, JSON.stringify(get().messages));
    });
    handle.onError((e) => {
      console.log('chat_error', e);
      set({ isStreaming: false });
    });
  },
  applySuggestion: (text, context) => get().send(text, context),
  hydrate: (key: string) => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.every(
            (m: any) => m && typeof m.id === 'string' && typeof m.role === 'string' && typeof m.content === 'string' && typeof m.createdAt === 'number'
          );
          if (valid) {
            set({ messages: parsed as Message[] });
          }
        }
      }
      set({ persistKey: key });
    } catch {
      // ignore bad/legacy data
    }
  },
}));

export function useChatPersistence(routeKey: string) {
  const hydrate = useChatStore((s) => s.hydrate);
  useEffect(() => { hydrate(`chat:${routeKey}`); }, [hydrate, routeKey]);
}

