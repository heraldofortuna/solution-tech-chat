"use client";
import { FileIcon } from "lucide-react";
import { LuCheckCheck, LuDownload } from "react-icons/lu";
import { ChatFile } from "@/types/chatfile";
import { Sender } from "@/types/sender";

interface ChatMessageProps {
  message: {
    id: string;
    text?: string;
    files?: ChatFile[];
    sender: Sender;
    createdAt: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      id={`message-${message.id}`}
      className={`relative max-w-[90%] md:max-w-[60%] text-sm md:text-base p-3 pb-8 mb-3 rounded-2xl ${
        message.sender === 'user' 
          ? 'ml-auto bg-[#4F46E5] text-white' 
          : 'mr-auto bg-white border border-[#E2E8F0] dark:text-black'
      }`}
    >
      {message.text && <p className="mb-2">{message.text}</p>}
      {message.files?.map((file: ChatFile, index: number) => (
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
                  src={file.url}
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
      <span className="absolute bottom-3 right-3 text-xs font-medium flex items-center gap-1 opacity-50">
        {message.createdAt} <LuCheckCheck />
      </span>
    </div>
  );
}