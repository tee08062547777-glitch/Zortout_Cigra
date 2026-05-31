import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 px-[22px] backdrop-blur">
      <div className="flex min-h-[76px] items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-[#111827]">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl truncate text-sm text-[#6B7280]">
            {subtitle}
          </p>
        </div>
        {children && (
          <div className="flex flex-shrink-0 items-center gap-2.5">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
