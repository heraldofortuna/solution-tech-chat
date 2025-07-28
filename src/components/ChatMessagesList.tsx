"use client";
import { Message } from "@/types/message";
import { ChatMessage } from "./ChatMessage";

interface ChatMessagesListProps {
  messages: Message[];
  sessions: any[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessagesList({
  messages,
  sessions,
  scrollContainerRef,
}: ChatMessagesListProps) {
  if (sessions.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-sm font-medium">Cree un nuevo chat</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-sm font-medium">No hay mensajes</p>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="flex-1 scrollContainer overflow-y-auto">
      {messages.map((message: Message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}