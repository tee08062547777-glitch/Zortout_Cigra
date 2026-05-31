export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6F8]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#CBD5E1] border-t-[#0F766E]" />
        <div className="text-sm font-semibold text-[#475569]">
          กำลังโหลด...
        </div>
      </div>
    </div>
  );
}
