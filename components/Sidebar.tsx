"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navItems = [
  {
    href: "/dashboard",
    label: "สินค้าพร้อมส่ง",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7.5 12 3 4 7.5m16 0-8 4.5m8-4.5v9L12 21m0-9L4 7.5m8 4.5v9m-8-13.5v9L12 21"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "ตั้งค่า",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-offset",
      collapsed ? "68px" : "210px",
    );
    window.localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 right-0 z-50 flex h-16 flex-row border-t border-[#E5E7EB] bg-white shadow-sm transition-[width] duration-200 md:right-auto md:top-0 md:h-auto md:flex-col md:border-r md:border-t-0 ${
        collapsed ? "md:w-[68px]" : "md:w-[210px]"
      }`}
    >
      <div
        className={`hidden border-b border-[#E5E7EB] py-4 md:block ${
          collapsed ? "px-3" : "px-4"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => collapsed && setCollapsed(false)}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] transition-colors ${
              collapsed
                ? "cursor-pointer hover:border-[#0EA5E9] hover:bg-[#F0F9FF]"
                : "cursor-default"
            }`}
            aria-label={collapsed ? "เปิดเมนู" : "Zort Stock"}
            title={collapsed ? "เปิดเมนู" : "Zort Stock"}
          >
            <Image
              src="/zort-logo.svg"
              alt="Zort Stock"
              width={42}
              height={32}
              priority
            />
          </button>
          <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
            <div className="truncate text-sm font-bold leading-tight text-[#111827]">
              Zort Stock
            </div>
            <div className="text-xs font-medium text-[#6B7280]">
              Dashboard
            </div>
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              aria-label="ซ่อนเมนู"
              title="ซ่อนเมนู"
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
                  strokeWidth={2}
                  d="M15 19 8 12l7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <nav className="flex flex-1 items-center justify-around gap-1 p-2 md:block md:space-y-1 md:p-2.5">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs font-semibold transition-colors md:w-full md:flex-none md:flex-row md:items-center md:justify-start md:text-sm ${
                collapsed
                  ? "md:justify-center md:px-0 md:py-2.5"
                  : "md:gap-2.5 md:px-3 md:py-2.5"
              } ${
                active
                  ? "bg-[#E0F2FE] text-[#075985]"
                  : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  active ? "bg-white text-[#0284C7]" : "bg-[#F8FAFC]"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`mt-0.5 max-w-full truncate md:mt-0 ${
                  collapsed ? "md:hidden" : "md:block"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center border-l border-[#E5E7EB] p-2 md:block md:border-l-0 md:border-t md:p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex items-center justify-center rounded-xl px-2 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 md:w-full ${
            collapsed ? "md:px-0 md:py-2.5" : "md:gap-2.5 md:px-3 md:py-2.5"
          }`}
          title="ออกจากระบบ"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3H9m9.75 0-3-3m3 3-3 3"
              />
            </svg>
          </span>
          <span className={collapsed ? "hidden" : "hidden md:block"}>
            ออกจากระบบ
          </span>
        </button>
        <div
          className={`mt-3 hidden px-3 text-xs font-medium text-[#9CA3AF] ${
            collapsed ? "md:hidden" : "md:block"
          }`}
        >
          v4.0
        </div>
      </div>
    </aside>
  );
}
