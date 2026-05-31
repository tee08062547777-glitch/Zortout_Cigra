"use client";

import { useState, useCallback } from "react";

interface FilterBarProps {
  onSearch: (search: string) => void;
  onMinStockChange: (min: number) => void;
}

export function FilterBar({ onSearch, onMinStockChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [minStock, setMinStock] = useState("1");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      onSearch(value);
    },
    [onSearch],
  );

  const handleMinStockChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMinStock(value);
      onMinStockChange(Number(value) || 0);
    },
    [onMinStockChange],
  );

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white p-2.5">
      <div className="relative min-w-[150px] flex-1">
        <svg
          className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="ค้นหาสินค้า / กลิ่น / รุ่น..."
          className="w-full rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-[7px_10px_7px_30px] font-sans text-xs text-[#111827] outline-none transition-colors focus:border-[#10B981]"
        />
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1.5">
        <label className="whitespace-nowrap text-xs text-[#6B7280]">
          มากกว่า
        </label>
        <input
          type="number"
          value={minStock}
          onChange={handleMinStockChange}
          min="0"
          step="1"
          className="w-12 border-none bg-transparent text-center font-sans text-xs text-[#111827] outline-none"
        />
        <label className="whitespace-nowrap text-xs text-[#6B7280]">ชิ้น</label>
      </div>
    </div>
  );
}
