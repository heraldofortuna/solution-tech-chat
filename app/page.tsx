"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes"
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessagesList } from "@/components/ChatMessagesList";
import { ChatInput } from "@/components/ChatInput";
import { Message } from "@/types/message";
import { ChatSession } from "@/types/chatsession";

export default function Page() {
  const { setTheme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [searchedMessageId, setSearchedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTextareaFocused, setIsTextareaFocused] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const allowedFiles = newFiles.filter(file => 
        file.type.match(/image\/(jpg|jpeg|png)|video\/mp4|application\/pdf/)
      );
      setFiles(prev => [...prev, ...allowedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createNewSession = async () => {
    const res = await fetch('/api/chat-sessions', { method: 'POST' });
    const newSession = await res.json();
    setCurrentChatId(newSession.id);
    setSessions(prev => [...prev, newSession]);
  };

  const selectSession = (session: ChatSession) => {
    setCurrentChatId(session.id)
  }

  const scrollToChatBottom = () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }, 200);
  }

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search-messages?q=${encodeURIComponent(search)}`);
      const data = await res.json();

      if (data.length > 0) {
        if (data[0].sessionId === currentChatId) {
          scrollToSearchedMessage(data[0].id);
        } else {
          setCurrentChatId(data[0].sessionId);
          setSearchedMessageId(data[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSearchedMessage = (messageId: string) => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          messageElement.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => {
            messageElement.classList.remove('ring-2', 'ring-blue-500');
          }, 2000);
        }
      });
    }, 200);
  };

  const loadMessages = async () => {
    const res = await fetch(`/api/chat-sessions/${currentChatId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async (
    chatId: string, 
    text: string, 
    files: File[] = []
  ) => {
    const formData = new FormData();
    formData.append('text', text);
    
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    const response = await fetch(`/api/chat-sessions/${chatId}/messages`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() && files.length === 0) return;

    setIsLoading(true);

    try {
      await sendMessage(currentChatId, input, files);

      setInput('');
      setFiles([]);

      await loadMessages();

      scrollToChatBottom();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode])

  useEffect(() => {
    if (currentChatId === 'default') return;
    loadMessages();
    setIsTextareaFocused(!isTextareaFocused);
    if (searchedMessageId) {
      scrollToSearchedMessage(searchedMessageId);
      setSearchedMessageId(null);
    } else {
      scrollToChatBottom();
    }
  }, [currentChatId]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const setupMocks = async () => {
        const { worker } = await import('@/mocks/browser');
        await worker.start();
      };
      setupMocks();
    }
  }, []);

  return (
    <div className="flex">
      <ChatSidebar
        sessions={sessions}
        currentChatId={currentChatId}
        onCreateNewSession={createNewSession}
        onSelectSession={selectSession}
      />
      
      <div className="bg-[#F8FAFC] dark:bg-[#000] w-full h-screen flex flex-col">
        <ChatHeader
          search={search}
          isDarkMode={isDarkMode}
          onSearchChange={setSearch}
          onSearch={handleSearch}
          onToggleTheme={toggleTheme}
        />
        
        <main className="main p-6 md:py-8 md:px-12">
          <div className="h-full flex flex-col gap-6">
            <ChatMessagesList
              messages={messages}
              sessions={sessions}
              scrollContainerRef={scrollContainerRef}
            />
            
            <ChatInput
              input={input}
              files={files}
              isLoading={isLoading}
              hasSessions={sessions.length > 0}
              autoFocus={isTextareaFocused}
              onInputChange={setInput}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              onSubmit={handleSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  );
}