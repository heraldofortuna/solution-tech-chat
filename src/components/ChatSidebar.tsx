"use client";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types/chatsession";
import { IoMdAdd } from "react-icons/io";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentChatId: string;
  onCreateNewSession: () => void;
  onSelectSession: (session: ChatSession) => void;
}

export function ChatSidebar({
  sessions,
  currentChatId,
  onCreateNewSession,
  onSelectSession,
}: ChatSidebarProps) {
  return (
    <aside className="min-w-12 w-12 md:min-w-20 h-screen border-r">
      <div className="flex flex-col items-center gap-2 md:gap-4 px-2 md:px-4 py-15 md:py-20">
        <Button
          type="button"
          className="!w-8 md:!w-10 !h-8 md:!h-10 cursor-pointer"
          onClick={onCreateNewSession}
        >
          <IoMdAdd />
        </Button>
        <span className="w-full h-px bg-border"></span>
        {sessions.map((session: ChatSession, index: number) => (
          <div key={session.id}>
            <Button
              type="button"
              className="!w-8 md:!w-10 !h-8 md:!h-10 cursor-pointer"
              variant={currentChatId === session.id ? 'default' : 'outline'}
              onClick={() => onSelectSession(session)}
            >
              {index + 1}
            </Button>
          </div>
        ))}
      </div>
    </aside>
  );
}