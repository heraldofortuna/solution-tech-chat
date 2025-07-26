"use client";
import { useEffect, useState } from "react";
import { FaBeer } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@/types/message";

export default function Page() {
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
      setMessages(data);
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
      <aside className="bg-white w-20 h-screen border-r border-gray-200">
        <div className="flex flex-col">
        </div>
      </aside>
      <div className="bg-[#F8FAFC] w-full h-screen flex flex-col">
        <header className="w-full border-b border-gray-200 p-2 md:p-6">
          <div className="flex items-center gap-6">
            <h1 className="text-lg md:text-3xl font-bold leading-10">SolutionTech🤖</h1>
          </div>
        </header>
        <main className="h-full p-6 md:py-8 md:px-24">
          <div className="h-full flex flex-col gap-6">
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 p-4 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'ml-auto bg-blue-500 text-white' 
                      : 'mr-auto bg-gray-200'
                  }`}
                >
                  {message.text}
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