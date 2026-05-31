"use client";

import Link from "next/link";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-[200px] flex-col border-r border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#10B981] text-sm font-semibold text-white">
            Z
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight text-[#111827]">
              Zort Stock
            </div>
            <div className="text-xs text-[#6B7280]">Stock Manager</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-2.5">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#ECFDF5] text-[#047857]"
                  : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  active ? "bg-white text-[#059669]" : "bg-[#F8FAFC]"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#E5E7EB] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F8FAFC]">
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
          <span>ออกจากระบบ</span>
        </button>
        <div className="mt-3 px-3 text-xs text-[#9CA3AF]">v4.0</div>
      </div>
    </aside>
  );
}
