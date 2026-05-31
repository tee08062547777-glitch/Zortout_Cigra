"use client";

import { useState } from "react";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (data: string) => Promise<void>;
}

export function SyncModal({ isOpen, onClose, onSync }: SyncModalProps) {
  const [pasted, setPasted] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPasted(value);

    if (value.length > 50) {
      setHint("✓ พร้อมอัปเดต");
    } else if (value.length > 0) {
      setHint("...");
    } else {
      setHint("");
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await onSync(pasted);
      setPasted("");
      onClose();
    } catch (error) {
      setHint("❌ เกิดข้อผิดพลาด: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-200 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[520px] p-[22px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-1">⬆ อัปเดตสต็อกสินค้า</h2>
        <p className="text-sm text-[#6B7280] mb-3.5 leading-relaxed">
          วางข้อมูลจาก Zortout — ระบบจะจัดกลุ่มและอัปเดตสต็อกให้อัตโนมัติ
        </p>

        <div className="bg-[#F8FAFC] rounded-lg p-2.5 mb-3">
          <div className="flex gap-2.5 items-start p-1.25 text-sm text-[#6B7280]">
            <div className="w-5 h-5 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              เปิดเว็บ Zortout → เปลี่ยนเป็น{" "}
              <span className="text-[#059669] font-semibold">
                100 รายการต่อหน้า
              </span>
            </div>
          </div>
          <div className="flex gap-2.5 items-start p-1.25 text-sm text-[#6B7280]">
            <div className="w-5 h-5 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              กด <span className="text-[#059669] font-semibold">Ctrl+A</span>{" "}
              แล้ว <span className="text-[#059669] font-semibold">Ctrl+C</span>
            </div>
          </div>
          <div className="flex gap-2.5 items-start p-1.25 text-sm text-[#6B7280]">
            <div className="w-5 h-5 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              วางในช่องด้านล่าง ทำซ้ำทุกหน้าจนครบ แล้วกด{" "}
              <span className="text-[#059669] font-semibold">บันทึก</span>
            </div>
          </div>
        </div>

        {hint && (
          <div
            className={`text-xs min-h-[18px] mb-2 ${
              hint.includes("✓")
                ? "text-[#059669]"
                : hint.includes("❌")
                  ? "text-red-600"
                  : "text-[#6B7280]"
            }`}
          >
            {hint}
          </div>
        )}

        <textarea
          value={pasted}
          onChange={handlePasteChange}
          placeholder="วางข้อมูลจาก Zortout ที่นี่..."
          className="w-full h-44 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-[#111827] font-mono text-xs p-2.5 outline-none resize-vertical focus:border-[#10B981]"
        />

        <div className="flex gap-2 justify-end mt-3.5">
          <button
            onClick={onClose}
            className="bg-none border border-[#E5E7EB] rounded-lg px-4 py-2 font-sans text-sm text-[#6B7280] cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSync}
            disabled={loading || !pasted.trim()}
            className="bg-[#10B981] text-white border-none rounded-lg px-4 py-2 font-sans text-sm font-medium cursor-pointer hover:bg-[#059669] disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
