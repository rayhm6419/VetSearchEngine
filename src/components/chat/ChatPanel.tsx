'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useChatStore, useChatPersistence } from '@/lib/chat/chatStore';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import TypingDots from './TypingDots';
import { Message } from '@/lib/chat/types';

export default function ChatPanel() {
  const { isOpen, close, messages, send, isStreaming, applySuggestion } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const pathname = usePathname();
  const params = useSearchParams();
  const context = useMemo(() => ({
    zip: params.get('zip') || undefined,
    type: params.get('type') || undefined,
    radius: params.get('radius') ? Number(params.get('radius')) : undefined,
  }), [params]);

  useChatPersistence(pathname || '/');

  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isOpen, isStreaming]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const onSend = () => {
    if (!value.trim() || isStreaming) return;
    send(value.trim(), context);
    setValue('');
  };

  const charCount = value.length;
  const maxChars = 1000;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div id="chat-panel" className="fixed inset-0 z-50 sm:inset-y-0 sm:right-0 sm:left-auto">
      {/* Backdrop (mobile) */}
      <div className="sm:hidden fixed inset-0 bg-black/30" onClick={close} />
      
      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="PetCare Assistant"
        className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl border-l flex flex-col"
      >
        {/* Header */}
        <header className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">PetCare Assistant</h2>
              <p className="text-xs text-gray-600">Ask about vets & shelters</p>
            </div>
            <button onClick={close} aria-label="Close chat" className="rounded border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
          </div>
        </header>

        {/* Body */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Context chip (optional) */}
          {(context.zip || context.type) && (
            <div className="text-xs text-gray-700 inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
              <span>Context:</span>
              {context.zip && <span>ZIP {context.zip}</span>}
              {context.type && <span>{context.type}</span>}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <div className="text-5xl mb-3">🐾</div>
              <p>How can I help with pet care near you?</p>
              <div className="mt-4 flex justify-center">
                <SuggestionChips onPick={(t) => applySuggestion(t, context)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m: Message) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isStreaming && (
                <div className="pl-1"><TypingDots /></div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-4 py-3 border-t">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => e.target.value.length <= maxChars && setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              className="flex-1 rounded-lg border px-3 py-2 text-sm max-h-32 min-h-[40px]"
            />
            <button
              onClick={onSend}
              disabled={!value.trim() || isStreaming}
              className="rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-60"
            >
              Send
            </button>
          </div>
          <div className="mt-1 text-right text-xs text-gray-500">{charCount}/{maxChars}</div>
        </footer>
      </section>
    </div>
  );
}


