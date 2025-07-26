"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaRegMoon, FaSearch } from "react-icons/fa";
import { GoSun } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { LuSendHorizontal, LuCheckCheck, LuPaperclip, LuDownload } from "react-icons/lu";
import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@/types/message";
import { ChatSession } from "@/types/chatsession";

export default function Page() {
  const { setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const focusTextarea = () => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 200)
  };

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
      focusTextarea();
    }
  };

  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode])

  useEffect(() => {
    if (currentChatId === 'default') return;
    loadMessages();
    focusTextarea();
    scrollToChatBottom();
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
      <aside className="min-w-4 md:min-w-20 h-screen border-r">
        <div className="flex flex-col items-center gap-2 md:gap-4 px-2 md:px-4 py-15 md:py-20">
          <Button
            type="button"
            className="!w-8 md:!w-10 !h-8 md:!h-10 cursor-pointer"
            onClick={createNewSession}
          >
            <IoMdAdd />
          </Button>
          <span className="w-full h-px bg-border"></span>
          {sessions.map((session: any, index: number) => (
            <div key={session.id}>
              <Button
                type="button"
                className="!w-8 md:!w-10 !h-8 md:!h-10 cursor-pointer"
                variant={currentChatId === session.id ? 'default' : 'outline'}
                onClick={() => selectSession(session)}
              >
                {index + 1}
              </Button>
            </div>
          ))}
        </div>
      </aside>
      <div className="bg-[#F8FAFC] dark:bg-[#000] w-full h-screen flex flex-col">
        {/* Header */}
        <header className="w-full h-15 md:h-20 border-b px-6 md:px-12">
          <div className="h-full flex items-center justify-between gap-6">
            <h1 className="hidden md:block text-lg md:text-3xl font-bold leading-10 whitespace-nowrap">SolutionTech🤖</h1>
            <h1 className="block md:hidden text-lg md:text-3xl font-bold leading-10 whitespace-nowrap">ST🤖</h1>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Buscar mensaje"
                className="!bg-white dark:!bg-[#181414] text-sm md:text-base"
              />
              <Button
                type="button"
                className="!w-9 !h-9 cursor-pointer"
                disabled={search.length === 0}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaSearch />
              </Button>
              <Button className="cursor-pointer" variant="outline" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <FaRegMoon /> : <GoSun />}
              </Button>
            </div>
          </div>
        </header>
        {/* Main */}
        <main className="main p-6 md:py-8 md:px-12">
          <div className="h-full flex flex-col gap-6">
            {/* Área de mensajes */}
            {sessions.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-sm font-medium">Cree un nuevo chat</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-sm font-medium">No hay mensajes</p>
              </div>
            ) : (
              <div ref={scrollContainerRef} className="flex-1 scrollContainer overflow-y-auto">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`relative max-w-[90%] md:max-w-[60%] text-sm md:text-base p-3 pb-8 mb-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'ml-auto bg-[#4F46E5] text-white' 
                        : 'mr-auto bg-white border border-[#E2E8F0] dark:text-black'
                    }`}
                  >
                    {message.text && <p className="mb-2">{message.text}</p>}
                    {message.files?.map((file: any, index: number) => (
                      <div key={index} className="mt-2 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : file.type === 'application/pdf' ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={file.name}
                            className="w-fit flex items-center justify-between gap-4 p-3 border rounded-xl ml-auto cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FileIcon type={file.type} />
                              <span className="flex-1">{file.name}</span>
                            </div>
                            <span className="text-xs italic pt-1">{file.size}</span>
                          </a>
                        ) : file.type === 'video/mp4' ? (
                            <div className="flex flex-col gap-2">
                              <video 
                                controls 
                                className="max-h-64 rounded-lg"
                                src={file.url || URL.createObjectURL(file)}
                              />
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={file.name}
                                className="flex items-center gap-2 text-sm ml-auto mb-2"
                              >
                                <LuDownload className="h-4 w-4" />
                                Descargar
                              </a>
                            </div>
                          ) : (
                          <div className="p-3 flex items-center gap-2">
                            <FileIcon type={file.type} />
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {file.name}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                    <span className="absolute bottom-3 right-3 text-xs font-medium flex items-center gap-1 opacity-50">{message.createdAt} <LuCheckCheck /></span>
                  </div>
                ))}
              </div>
            )}
            {/* Formulario de chat */}
            <form onSubmit={handleSubmit} className="mt-auto mx-0 flex flex-col items-end gap-2 md:gap-4">
              {/* Vista previa de archivos */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-4 p-2 border rounded-lg">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : file.type === 'application/pdf' ? (
                        <div className="h-16 w-16 bg-red-100 flex items-center justify-center rounded">
                          <span className="text-xs text-red-600">PDF</span>
                        </div>
                      ) : file.type === 'video/mp4' ? (
                        <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded">
                          <span className="text-xs text-blue-600">MP4</span>
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded">
                          <span className="text-xs text-blue-600">File</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-gray-200 !w-6 !h-6 rounded-lg p-1 cursor-pointer"
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea 
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="!bg-white dark:!bg-[#181414] !h-20 md:!h-40 text-sm md:text-base font-medium p-4 !rounded-3xl"
                disabled={isLoading || !sessions.length}
              />
              <div className="flex items-center gap-2 md:gap-4">
                <Input
                  id="picture"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.mp4"
                  multiple
                  className="!hidden"
                />
                <Button
                  type="button"
                  className="!w-10 !h-10 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <LuPaperclip className="h-5 w-5" />
                </Button>
                <Button className="cursor-pointer" type="submit" size="lg" disabled={isLoading || (!input.trim() && files.length === 0)}>
                  {isLoading ? 'Enviando...' : 'Enviar'} <LuSendHorizontal />
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}