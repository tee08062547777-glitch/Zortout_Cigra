import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur sm:px-[22px]">
      <div className="flex min-h-[76px] flex-col items-start justify-center gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#111827] sm:truncate sm:text-xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[#6B7280] sm:truncate sm:text-sm">
            {subtitle}
          </p>
        </div>
        {children && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-shrink-0 sm:justify-end sm:gap-2.5">
            <ThemeToggle />
            {children}
          </div>
        )}
        {!children && (
          <div className="flex w-full sm:w-auto">
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
