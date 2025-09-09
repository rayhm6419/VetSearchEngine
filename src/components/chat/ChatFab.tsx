'use client';

import { useChatStore } from '@features/chat/application/chatStore';
import { useEffect, useRef } from 'react';

export default function ChatFab() {
  const { isOpen, open, close, unreadCount } = useChatStore();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape' && isOpen) {
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, open, close]);

  return (
    <button
      ref={btnRef}
      aria-label="Open chat"
      aria-controls="chat-panel"
      aria-expanded={isOpen}
      onClick={() => (isOpen ? close() : open())}
      className="fixed bottom-5 right-5 z-40 rounded-full bg-black text-white px-5 py-3 shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Chat
      {unreadCount > 0 && (
        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-red-600 text-white rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

