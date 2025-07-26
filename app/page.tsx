"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaRegMoon, FaSearch } from "react-icons/fa";
import { GoSun } from "react-icons/go";
import { LuSendHorizontal, LuCheckCheck, LuPaperclip, LuDownload } from "react-icons/lu";
import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@/types/message";
import timestampToHHMM from "@/utils/timestampToHHMM";

export default function Page() {
  const { setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
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

  const loadMessages = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/messages');
      const data = await res.json();
      const messages = data.map((message: any) => ({
        id: message.id,
        text: message.text,
        sender: message.sender,
        time: timestampToHHMM(message.createdAt),
        files: message.files,
      }));

      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() && files.length === 0) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', input);
      
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al enviar');

      await loadMessages();

      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });

      setInput('');
      setFiles([]);
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
      <aside className="hidden md:block w-20 h-screen border-r">
        <div className="flex flex-col">
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
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <FaRegMoon /> : <GoSun />}
              </Button>
            </div>
          </div>
        </header>
        {/* Main */}
        <main className="main p-6 md:py-8 md:px-12">
          <div className="h-full flex flex-col gap-6">
            {/* Área de mensajes */}
            {messages.length === 0 ? (
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
                            src={file.image}
                            alt={file.name}
                            className="max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : file.type === 'application/pdf' ? (
                          <a
                            href={file.image}
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
                                src={file.image || URL.createObjectURL(file)}
                              />
                              <a
                                href={file.image}
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
                    <span className="absolute bottom-3 right-3 text-xs font-medium flex items-center gap-1 opacity-50">{message.time} <LuCheckCheck /></span>
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="!bg-white dark:!bg-[#181414] !h-20 md:!h-40 text-sm md:text-base font-medium p-4 !rounded-3xl"
                disabled={isLoading}
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