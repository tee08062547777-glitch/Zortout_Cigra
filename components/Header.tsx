"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSyncComplete?: () => void | Promise<void>;
  children?: ReactNode;
}

export function Header({
  title,
  subtitle = "จัดการข้อมูลสินค้าและการซิงค์สต็อก",
  onSyncComplete,
  children,
}: HeaderProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const loadUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setEmail(user?.email || null);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadUser);
  }, [loadUser]);

  const handleSync = async () => {
    setSyncLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/sync-stock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }

      await onSyncComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("ซิงค์ไม่สำเร็จ: " + message);
    } finally {
      setSyncLoading(false);
    }
  };

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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-shrink-0 sm:justify-end sm:gap-2.5">
          <ThemeToggle />
          {email && (
            <span className="whitespace-nowrap rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#6B7280]">
              {email}
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSync()}
            disabled={syncLoading}
            className="flex items-center justify-center gap-1.5 rounded-lg border-none bg-[#3B82F6] px-3 py-2 font-sans text-xs font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {syncLoading ? "กำลัง sync..." : "Sync Now"}
          </button>
          {children}
        </div>
      </div>
    </header>
  );
}
