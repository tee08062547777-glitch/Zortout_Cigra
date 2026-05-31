"use client";

import { useState } from "react";
import { downloadBlob, generateGridImages } from "@/lib/imageGenerator";

interface SelectedItem {
  key: string;
  group: string;
  variant: string;
  stock: number;
  image_url: string | null;
}

interface RightPanelProps {
  selectedItems: SelectedItem[];
  showQty: boolean;
  onShowQtyChange: (show: boolean) => void;
  onViewList: () => void;
  onRemoveItem: (key: string) => void;
  onClearItems: () => void;
}

export function RightPanel({
  selectedItems,
  showQty,
  onShowQtyChange,
  onViewList,
  onRemoveItem,
  onClearItems,
}: RightPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const previewText = generatePreviewText(selectedItems, showQty);
  const groupedItems = groupSelectedItems(selectedItems);
  const hasSelection = selectedItems.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImages = async () => {
    if (!hasSelection) return;

    setDownloading(true);
    try {
      const images = await generateGridImages(selectedItems, {
        showStock: showQty,
      });
      images.forEach((blob, index) => {
        const suffix = images.length > 1 ? `-${index + 1}` : "";
        downloadBlob(blob, `selected-products${suffix}.png`);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert("ดาวน์โหลดรูปไม่สำเร็จ: " + message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="sticky top-20 flex max-h-[620px] w-72 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              รายการที่เลือก
            </h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {selectedItems.length} รายการ
            </p>
          </div>
          <button
            type="button"
            onClick={onClearItems}
            disabled={!hasSelection}
            className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ล้างทั้งหมด
          </button>
        </div>

        <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#6B7280]">
          <span>แสดงจำนวนในลิสต์และรูป</span>
          <input
            type="checkbox"
            checked={showQty}
            onChange={(e) => onShowQtyChange(e.target.checked)}
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {!hasSelection ? (
          <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAFC] p-6 text-center text-xs leading-6 text-[#9CA3AF]">
            ยังไม่ได้เลือกสินค้า
            <br />
            ติ๊กสินค้าจากตารางด้านซ้าย
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems)
              .sort((a, b) => a[0].localeCompare(b[0], "th"))
              .map(([group, items]) => (
                <section key={group}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      {group}
                    </div>
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-[#F8FAFC]"
                      >
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F8FAFC]">
                          {item.image_url ? (
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${item.image_url})`,
                              }}
                              aria-label={item.variant}
                              role="img"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[#9CA3AF]">
                              No
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-[#374151]">
                            {item.variant}
                          </div>
                          {showQty && (
                            <div className="mt-0.5 text-xs text-[#9CA3AF]">
                              {item.stock} ชิ้น
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`ลบ ${item.variant}`}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] p-3.5">
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-semibold text-[#6B7280]">
            ตัวอย่างลิสต์ LINE
          </div>
          <div className="max-h-[120px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-2.5 font-mono text-xs text-[#111827]">
            {previewText || "-"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewList}
            disabled={!hasSelection}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#8B5CF6] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
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
                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              />
            </svg>
            ดูรายการ
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!previewText}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              copied ? "bg-[#6B7280]" : "bg-[#10B981] hover:bg-[#059669]"
            }`}
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
                d="M8 8h8v10H8z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              />
            </svg>
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownloadImages}
          disabled={downloading || !hasSelection}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
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
              d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
            />
          </svg>
          {downloading ? "กำลังสร้างรูป..." : "ดาวน์โหลดรูป"}
        </button>
      </div>
    </div>
  );
}

function groupSelectedItems(selectedItems: SelectedItem[]) {
  return selectedItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, SelectedItem[]>,
  );
}

function generatePreviewText(
  selectedItems: SelectedItem[],
  showQty: boolean,
): string {
  if (selectedItems.length === 0) return "";

  const grouped = groupSelectedItems(selectedItems);
  const lines: string[] = [];

  Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0], "th"))
    .forEach(([group, items]) => {
      lines.push(group);
      items.forEach((item) => {
        lines.push(`- ${item.variant}${showQty ? ` ${item.stock}` : ""}`);
      });
      lines.push("");
    });

  return lines.join("\n").trim();
}
