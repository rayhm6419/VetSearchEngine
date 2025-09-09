export default function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 text-gray-500" aria-live="polite">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="sr-only">Assistant is typing…</span>
    </div>
  );
}


