"use client";

interface ProductModalItem {
  pid: string;
  sku: string;
  product_name: string;
  full_name: string;
  variant: string | null;
  stock: number;
  unit: string | null;
  image_url: string | null;
}

interface ProductModalProps {
  isOpen: boolean;
  products: ProductModalItem[];
  onClose: () => void;
}

export function ProductModal({ isOpen, products, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  const groupedProducts = products.reduce(
    (acc, product) => {
      if (!acc[product.product_name]) acc[product.product_name] = [];
      acc[product.product_name].push(product);
      return acc;
    },
    {} as Record<string, ProductModalItem[]>,
  );

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-lg sm:max-h-[85vh] sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#111827]">
              รายการสินค้าที่เลือก
            </h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              {products.length} รายการ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-lg leading-none text-[#6B7280] transition-colors hover:border-red-200 hover:text-red-600"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D1D5DB] p-8 text-center text-sm text-[#6B7280]">
              ยังไม่ได้เลือกรายการสินค้า
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedProducts)
                .sort((a, b) => a[0].localeCompare(b[0], "th"))
                .map(([group, items]) => (
                  <section
                    key={group}
                    className="overflow-hidden rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-center justify-between gap-3 bg-[#F8FAFC] px-4 py-3">
                      <h3 className="min-w-0 break-words text-sm font-semibold text-[#111827]">
                        {group}
                      </h3>
                      <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-xs text-[#6B7280]">
                        {items.length} รายการ
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5E7EB]">
                      {items.map((item) => (
                        <div
                          key={`${item.pid}-${item.variant || ""}`}
                          className="flex items-center gap-3 px-3 py-3 sm:px-4"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]">
                            {item.image_url ? (
                              <div
                                className="h-full w-full bg-cover bg-center"
                                role="img"
                                aria-label={item.full_name}
                                style={{
                                  backgroundImage: `url(${item.image_url})`,
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-[#9CA3AF]">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-[#111827] sm:truncate">
                              {item.variant || item.full_name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                              SKU: {item.sku || "-"}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-semibold text-[#111827]">
                              {item.stock}
                            </div>
                            <div className="text-xs text-[#6B7280]">
                              {item.unit || "ชิ้น"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
