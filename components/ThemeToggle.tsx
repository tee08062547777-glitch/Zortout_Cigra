"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const saved = window.localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex h-10 w-[92px] items-center justify-between rounded-full border p-1 transition-colors ${
        isDark
          ? "border-[#1F2937] bg-[#111827]"
          : "border-[#E5E7EB] bg-white"
      }`}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className={`absolute top-1 h-8 w-8 rounded-full bg-[#34349A] transition-transform duration-200 ${
          isDark ? "translate-x-[50px]" : "translate-x-0"
        }`}
      />

      <span
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          isDark ? "text-[#94A3B8]" : "text-white"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.36-6.36-1.06 1.06M6.7 17.3l-1.06 1.06m12.72 0-1.06-1.06M6.7 6.7 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
          />
        </svg>
      </span>

      <span
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          isDark ? "text-white" : "text-[#CBD5E1]"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z"
          />
        </svg>
      </span>
    </button>
  );
}
