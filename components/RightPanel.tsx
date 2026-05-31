"use client";

import { useState } from "react";
import { downloadBlob, generateGridImages } from "@/lib/imageGenerator";

interface SelectedItem {
  group: string;
  variant: string;
  stock: number;
  image_url: string | null;
}

interface RightPanelProps {
  selectedItems: SelectedItem[];
  showQty: boolean;
  onViewList: () => void;
}

export function RightPanel({
  selectedItems,
  showQty,
  onViewList,
}: RightPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const previewText = generatePreviewText(selectedItems, showQty);
  const groupedItems = groupSelectedItems(selectedItems);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImages = async () => {
    if (selectedItems.length === 0) return;

    setDownloading(true);
    try {
      const images = await generateGridImages(selectedItems);
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
    <div className="w-72 flex-shrink-0 bg-white border border-[#E5E7EB] rounded-lg shadow-sm flex flex-col sticky top-20 max-h-[560px] overflow-hidden">
      <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
        <h3 className="text-sm font-semibold">รายการที่เลือก</h3>
        <span className="text-xs text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB] rounded-full px-2 py-1">
          {selectedItems.length} รายการ
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {selectedItems.length === 0 ? (
          <div className="text-center p-7 text-[#9CA3AF] text-xs leading-8">
            ยังไม่ได้เลือกสินค้า
            <br />
            กดติ๊กสินค้าที่ต้องการ
          </div>
        ) : (
          Object.entries(groupedItems)
            .sort((a, b) => a[0].localeCompare(b[0], "th"))
            .map(([group, items]) => (
              <div key={group}>
                <div className="text-xs font-semibold text-[#111827] p-1.5 border-b border-[#E5E7EB] mb-1">
                  {group}
                </div>
                {items.map((item) => (
                  <div
                    key={`${item.group}-${item.variant}`}
                    className="flex justify-between items-center p-1.25 text-xs gap-1.5"
                  >
                    <span className="text-[#6B7280] flex-1">
                      - {item.variant}
                    </span>
                    {showQty && (
                      <span className="text-[#9CA3AF] whitespace-nowrap">
                        {item.stock}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))
        )}
      </div>

      <div className="p-3.5 border-t border-[#E5E7EB] flex flex-col gap-2">
        <div>
          <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-1.25">
            ตัวอย่างลิสต์ LINE
          </div>
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2.5 font-mono text-xs text-[#111827] max-h-[150px] overflow-y-auto whitespace-pre-wrap">
            {previewText || "-"}
          </div>
        </div>
         <button
          onClick={onViewList}
          disabled={selectedItems.length === 0}
          className="w-full px-4 py-3 bg-[#8B5CF6] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ดูรายการ ({selectedItems.length})
        </button>
        <button
          onClick={handleCopy}
          disabled={!previewText}
          className={`w-full px-4 py-3 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            copied ? "bg-[#6B7280]" : "bg-[#10B981] hover:bg-[#059669]"
          }`}
        >
          {copied ? "คัดลอกแล้ว!" : "คัดลอกสำหรับ LINE"}
        </button>
       
        <button
          onClick={handleDownloadImages}
          disabled={downloading || selectedItems.length === 0}
          className="w-full px-4 py-3 bg-[#3B82F6] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
