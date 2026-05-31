"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CategoryPill {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryPillsProps {
  pills: CategoryPill[];
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryPills({ pills, active, onSelect }: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 2);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [pills.length, updateScrollButtons]);

  const scrollCategories = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -container.clientWidth * 0.75 : container.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mb-3.5 min-w-0 max-w-full overflow-hidden px-9">
      <button
        type="button"
        onClick={() => scrollCategories("left")}
        disabled={!canScrollLeft}
        aria-label="เลื่อนหมวดหมู่ไปทางซ้าย"
        className="absolute left-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm transition-colors hover:border-[#10B981] hover:text-[#059669] disabled:cursor-not-allowed disabled:opacity-35"
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
            d="m15 19-7-7 7-7"
          />
        </svg>
      </button>
      <div className="pointer-events-none absolute bottom-0 left-9 top-0 z-10 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-9 top-0 z-10 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent" />
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelect(pill.id)}
            className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 font-sans text-xs transition-all ${
              active === pill.id
                ? "border-[#10B981] bg-[#D1FAE5] font-medium text-[#059669]"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981] hover:text-[#10B981]"
            }`}
          >
            <span>{pill.icon}</span>
            <span>{pill.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollCategories("right")}
        disabled={!canScrollRight}
        aria-label="เลื่อนหมวดหมู่ไปทางขวา"
        className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm transition-colors hover:border-[#10B981] hover:text-[#059669] disabled:cursor-not-allowed disabled:opacity-35"
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
            d="m9 5 7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

interface StatsProps {
  inStock: number | string;
  selected: number | string;
  groups: number | string;
}

export function Stats({ inStock, selected, groups }: StatsProps) {
  return (
    <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      <StatCard label="พร้อมส่ง" value={inStock} />
      <StatCard label="เลือกแล้ว" value={selected} color="purple" />
      <StatCard label="กลุ่มสินค้า" value={groups} color="gray" />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  color?: "default" | "purple" | "gray";
}

function StatCard({ label, value, color = "default" }: StatCardProps) {
  const colorClasses = {
    default: "text-[#10B981]",
    purple: "text-[#7C3AED]",
    gray: "text-[#6B7280]",
  };

  return (
    <div className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="mb-1 truncate text-xs text-[#6B7280]">{label}</div>
      <div className={`text-xl font-semibold sm:text-2xl ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}
