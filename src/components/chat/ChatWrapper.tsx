"use client";

import dynamic from "next/dynamic";
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export default function ChatWrapper() {
  return <ChatPanel />;
}
