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
  showQty: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ProductGroup({
  group,
  items,
  selectedItems,
  onSelect,
  showQty,
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
    <div className="bg-white border border-[#E5E7EB] rounded-lg mb-2.5 overflow-hidden shadow-sm">
      <div
        className="flex items-center gap-2.5 p-3 bg-[#FAFAFA] border-b border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6] transition-colors"
        onClick={onToggleCollapse}
      >
        <input
          ref={groupCheckboxRef}
          type="checkbox"
          checked={allChecked}
          onChange={(e) => handleGroupCheck(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4"
        />
        <span className="text-sm font-semibold text-[#111827] flex-1">
          {group}
        </span>
        <span className="text-xs text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB] rounded-full px-2 py-0.5 whitespace-nowrap">
          {items.length} กลิ่น
        </span>
        <span
          className={`text-xs text-[#9CA3AF] ml-1 transition-transform ${
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
                className={`flex items-center gap-2.5 p-2 pl-7 border-b border-[#E5E7EB] cursor-pointer transition-colors last:border-b-0 ${
                  isSelected ? "bg-[#F0FDF4]" : "hover:bg-[#F9FAFB]"
                }`}
                onClick={() => onSelect(key, !isSelected)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(key, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4"
                />
                <span
                  className={`text-sm flex-1 ${
                    isSelected ? "text-[#059669] font-medium" : "text-[#6B7280]"
                  }`}
                >
                  {item.variant || item.fullName}
                </span>
                <span className="text-xs text-[#6B7280] min-w-[50px] text-right">
                  {showQty && `${item.stock} ชิ้น`}
                  {item.stock > 10 && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-[#D1FAE5] text-[#065F46] text-xs font-medium rounded-full whitespace-nowrap">
                      พร้อมส่ง
                    </span>
                  )}
                  {item.stock > 0 && item.stock <= 10 && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs font-medium rounded-full whitespace-nowrap">
                      ใกล้หมด
                    </span>
                  )}
                  {item.stock === 0 && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] text-xs font-medium rounded-full whitespace-nowrap">
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
