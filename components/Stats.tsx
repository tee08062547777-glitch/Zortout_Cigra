"use client";

import { ReactNode } from "react";

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
  return (
    <div className="flex gap-1.5 mb-3.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:h-0">
      {pills.map((pill) => (
        <button
          key={pill.id}
          onClick={() => onSelect(pill.id)}
          className={`px-3.5 py-1.5 rounded-full border font-sans text-xs whitespace-nowrap transition-all ${
            active === pill.id
              ? "bg-[#D1FAE5] border-[#10B981] text-[#059669] font-medium"
              : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#10B981] hover:text-[#10B981]"
          }`}
        >
          {pill.icon} {pill.label}
        </button>
      ))}
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
    <div className="flex gap-2.5 mb-3.5">
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
    <div className="flex-1 bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-sm">
      <div className="text-xs text-[#6B7280] mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}
