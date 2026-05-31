"use client";

import { useEffect, useRef } from "react";

interface Product {
  pid: string;
  fullName: string;
  variant: string;
  stock: number;
}

interface ProductGroupProps {
  group: string;
  items: Product[];
  selectedItems: Set<string>;
  onSelect: (key: string, checked: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ProductGroup({
  group,
  items,
  selectedItems,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}: ProductGroupProps) {
  const groupCheckboxRef = useRef<HTMLInputElement>(null);
  const allChecked = items.every((i) =>
    selectedItems.has(`${i.pid}||${i.variant}`),
  );
  const someChecked = items.some((i) =>
    selectedItems.has(`${i.pid}||${i.variant}`),
  );

  useEffect(() => {
    if (groupCheckboxRef.current) {
      groupCheckboxRef.current.indeterminate = !allChecked && someChecked;
    }
  }, [allChecked, someChecked]);

  const handleGroupCheck = (checked: boolean) => {
    items.forEach((i) => {
      const key = `${i.pid}||${i.variant}`;
      onSelect(key, checked);
    });
  };

  return (
    <div className="mb-2.5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div
        className="flex cursor-pointer items-center gap-2.5 border-b border-[#E5E7EB] bg-[#FAFAFA] p-3 transition-colors hover:bg-[#F3F4F6]"
        onClick={onToggleCollapse}
      >
        <input
          ref={groupCheckboxRef}
          type="checkbox"
          checked={allChecked}
          onChange={(e) => handleGroupCheck(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4"
        />
        <span className="min-w-0 flex-1 break-words text-sm font-semibold text-[#111827]">
          {group}
        </span>
        <span className="whitespace-nowrap rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-0.5 text-xs text-[#6B7280]">
          {items.length} กลิ่น
        </span>
        <span
          className={`ml-1 text-xs text-[#9CA3AF] transition-transform ${
            isCollapsed ? "" : "rotate-180"
          }`}
        >
          ▼
        </span>
      </div>

      {!isCollapsed && (
        <div>
          {items.map((item) => {
            const key = `${item.pid}||${item.variant}`;
            const isSelected = selectedItems.has(key);

            return (
              <div
                key={key}
                className={`flex cursor-pointer flex-wrap items-center gap-2.5 border-b border-[#E5E7EB] p-2 pl-4 transition-colors last:border-b-0 sm:flex-nowrap sm:pl-7 ${
                  isSelected ? "bg-[#F0FDF4]" : "hover:bg-[#F9FAFB]"
                }`}
                onClick={() => onSelect(key, !isSelected)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(key, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4"
                />
                <span
                  className={`min-w-[160px] flex-1 break-words text-sm ${
                    isSelected ? "font-medium text-[#059669]" : "text-[#6B7280]"
                  }`}
                >
                  {item.variant || item.fullName}
                </span>
                <span className="ml-6 min-w-[50px] text-left text-xs text-[#6B7280] sm:ml-0 sm:text-right">
                  {item.stock} ชิ้น
                  {item.stock > 10 && (
                    <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs font-medium text-[#065F46]">
                      พร้อมส่ง
                    </span>
                  )}
                  {item.stock > 0 && item.stock <= 10 && (
                    <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#92400E]">
                      ใกล้หมด
                    </span>
                  )}
                  {item.stock === 0 && (
                    <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-medium text-[#991B1B]">
                      หมด
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
