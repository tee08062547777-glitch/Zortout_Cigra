"use client";

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
    <div className="relative mb-3.5 min-w-0 max-w-full overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent" />
      <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
    <div className="mb-3.5 grid grid-cols-3 gap-2.5">
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
      <div className={`text-2xl font-semibold ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}
