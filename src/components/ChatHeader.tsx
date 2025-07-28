"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { ThemeToggle } from "./ThemeToggle";

interface ChatHeaderProps {
  search: string;
  isDarkMode: boolean;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onToggleTheme: () => void;
}

export function ChatHeader({
  search,
  isDarkMode,
  onSearchChange,
  onSearch,
  onToggleTheme,
}: ChatHeaderProps) {
  return (
    <header className="w-full h-15 md:h-20 border-b px-6 md:px-12">
      <div className="h-full flex items-center justify-between gap-6">
        <h1 className="hidden md:block text-lg md:text-3xl font-bold leading-10 whitespace-nowrap">SolutionTech🤖</h1>
        <h1 className="block md:hidden text-lg md:text-3xl font-bold leading-10 whitespace-nowrap">ST🤖</h1>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            type="text"
            placeholder="Buscar mensaje"
            className="!bg-white dark:!bg-[#181414] text-sm md:text-base"
          />
          <Button
            type="button"
            className="!w-9 !h-9 cursor-pointer"
            disabled={search.length === 0}
            onClick={onSearch}
          >
            <FaSearch />
          </Button>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}