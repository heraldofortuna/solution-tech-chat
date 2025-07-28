"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LuPaperclip, LuSendHorizontal } from "react-icons/lu";
import { FilePreview } from "./FilePreview";
import { ChangeEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  input: string;
  files: File[];
  isLoading: boolean;
  hasSessions: boolean;
  autoFocus?: boolean;
  onInputChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ChatInput({
  input,
  files,
  isLoading,
  hasSessions,
  autoFocus = false,
  onInputChange,
  onFileChange,
  onRemoveFile,
  onSubmit,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 200);
  }, [autoFocus]);

  return (
    <form onSubmit={onSubmit} className="mt-auto mx-0 flex flex-col items-end gap-2 md:gap-4">
      {files.length > 0 && (
        <FilePreview files={files} onRemoveFile={onRemoveFile} />
      )}
      <Textarea 
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="!bg-white dark:!bg-[#181414] !h-20 md:!h-40 text-sm md:text-base font-medium p-4 !rounded-3xl"
        disabled={isLoading || !hasSessions}
      />
      <div className="flex items-center gap-2 md:gap-4">
        <Input
          id="picture"
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
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
        <Button 
          className="cursor-pointer" 
          type="submit" 
          size="lg" 
          disabled={isLoading || (!input.trim() && files.length === 0)}
        >
          {isLoading ? 'Enviando...' : 'Enviar'} <LuSendHorizontal />
        </Button>
      </div>
    </form>
  );
}