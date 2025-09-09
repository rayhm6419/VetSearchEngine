import { Message } from '@/lib/chat/types';
import { useState } from 'react';

function renderMarkdown(text: string) {
  // minimal markdown: links and bullets
  const withLinks = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline text-blue-600" target="_blank" rel="noreferrer">$1<\/a>');
  const withBreaks = withLinks.replace(/\n/g, '<br/>');
  return withBreaks;
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 shadow ${
          isUser ? 'bg-black text-white rounded-br-sm' : 'bg-white text-gray-900 border rounded-bl-sm'
        }`}
      >
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: isUser ? message.content : renderMarkdown(message.content) }}
        />
        <button
          onClick={copy}
          aria-label="Copy message"
          className="absolute -top-2 -right-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-1"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <span className="sr-only" aria-live="polite">{copied ? 'Message copied' : ''}</span>
      </div>
    </div>
  );
}


