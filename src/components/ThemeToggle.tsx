"use client";
import { Button } from "@/components/ui/button";
import { FaRegMoon } from "react-icons/fa";
import { GoSun } from "react-icons/go";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <Button className="cursor-pointer" variant="outline" size="icon" onClick={onToggle}>
      {isDarkMode ? <FaRegMoon /> : <GoSun />}
    </Button>
  );
}