"use client";
import { useEffect, useState } from "react";
import { FaBeer } from "react-icons/fa";
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@/types/message";
import timestampToHHMM from "@/utils/timestampToHHMM";

export default function Page() {
  const { setTheme } = useTheme()
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Iniciar MSW solo en cliente
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const setupMocks = async () => {
        const { worker } = await import('@/mocks/browser');
        await worker.start();
      };
      setupMocks();
    }
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/messages');
      const data = await res.json();
      const messages = data.map((message: any) => ({
        id: message.id,
        text: message.text,
        sender: message.sender,
        time: timestampToHHMM(message.createdAt),
      }));
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      await loadMessages();
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <aside className="w-20 h-screen border-r">
        <div className="flex flex-col">
        </div>
      </aside>
      <div className=" w-full h-screen flex flex-col">
        <header className="w-full border-b p-2 md:p-6">
          <div className="flex items-center justify-between gap-6">
            <h1 className="text-lg md:text-3xl font-bold leading-10">SolutionTech🤖</h1>
            <div>
              <Input type="text" placeholder="Buscar mensaje" />
              <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="h-full p-6 md:py-8 md:px-24">
          <div className="h-full flex flex-col gap-6">
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`relative mb-4 p-4 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'ml-auto bg-blue-500 text-white' 
                      : 'mr-auto bg-gray-200'
                  }`}
                >
                  {message.text}
                  <span className="absolute bottom-0 right-0">{message.time}</span>
                </div>
              ))}
            </div>

            {/* Formulario de chat */}
            <form onSubmit={handleSubmit} className="mt-auto mx-0">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
              />
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar'} <FaBeer />
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}