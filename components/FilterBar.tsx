"use client";

import { useState, useCallback } from "react";

interface FilterBarProps {
  onSearch: (search: string) => void;
  onMinStockChange: (min: number) => void;
  onShowQtyChange: (show: boolean) => void;
}

export function FilterBar({
  onSearch,
  onMinStockChange,
  onShowQtyChange,
}: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [minStock, setMinStock] = useState("1");
  const [showQty, setShowQty] = useState(false);

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

  const handleShowQtyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setShowQty(checked);
      onShowQtyChange(checked);
    },
    [onShowQtyChange],
  );

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 flex items-center gap-2.5 mb-3 flex-wrap">
      <div className="flex-1 min-w-[150px] relative">
        <svg
          className="w-3.25 h-3.25 absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
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
          className="w-full p-[7px_10px_7px_30px] border border-[#E5E7EB] rounded-lg font-sans text-xs text-[#111827] bg-[#F8FAFC] outline-none transition-colors focus:border-[#10B981]"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-2.5 py-1.25">
        <label className="text-xs text-[#6B7280] whitespace-nowrap">
          มากกว่า
        </label>
        <input
          type="number"
          value={minStock}
          onChange={handleMinStockChange}
          min="0"
          step="1"
          className="w-13 border-none bg-transparent font-sans text-xs text-[#111827] outline-none text-center"
        />
        <label className="text-xs text-[#6B7280] whitespace-nowrap">ชิ้น</label>
      </div>

      <label className="flex items-center gap-1.5 text-xs text-[#6B7280] cursor-pointer whitespace-nowrap">
        <input
          type="checkbox"
          checked={showQty}
          onChange={handleShowQtyChange}
          className="w-4 h-4"
        />
        แสดงจำนวน
      </label>
    </div>
  );
}
