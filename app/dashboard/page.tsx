"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { CategoryPills, Stats } from "@/components/Stats";
import { ProductGroup } from "@/components/ProductGroup";
import { RightPanel } from "@/components/RightPanel";
import { ProductModal } from "@/components/ProductModal";
import { fallbackCategories, type Category } from "@/lib/categories";

interface Product {
  pid: string;
  sku: string;
  product_name: string;
  full_name: string;
  variant: string | null;
  stock: number;
  unit: string | null;
  image_url: string | null;
}

interface CategoryRow {
  id: string;
  label: string;
  icon: string | null;
  sort_order: number | null;
  category_keywords?: { keyword: string }[] | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minStock, setMinStock] = useState(1);
  const [showQty, setShowQty] = useState(false);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("all");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product_name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, label, icon, sort_order, category_keywords(keyword)")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });

    if (error) {
      console.warn("Falling back to JSON categories:", error.message);
      setCategories(fallbackCategories);
      return;
    }

    if (!data || data.length === 0) {
      setCategories(fallbackCategories);
      return;
    }

    setCategories(
      (data as CategoryRow[]).map((category) => ({
        id: category.id,
        label: category.label,
        icon: category.icon || "🏷️",
        keywords:
          category.category_keywords?.map((item) => item.keyword.trim()) ?? [],
      })),
    );
  }, []);

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    await Promise.all([loadCategories(), loadProducts()]);
  }, [loadCategories, loadProducts, router]);

  useEffect(() => {
    void Promise.resolve().then(checkAuth);
  }, [checkAuth]);

  const getCategoryForProduct = (product: Product): string => {
    const text = (
      product.product_name +
      " " +
      (product.variant || "")
    ).toLowerCase();
    let matchedCategory = "accessory";
    let matchedKeywordLength = 0;

    for (const cat of categories) {
      for (const keyword of cat.keywords) {
        const normalizedKeyword = keyword.toLowerCase();
        if (
          normalizedKeyword.length > matchedKeywordLength &&
          text.includes(normalizedKeyword)
        ) {
          matchedCategory = cat.id;
          matchedKeywordLength = normalizedKeyword.length;
        }
      }
    }

    return matchedCategory;
  };

  const filteredProducts = products.filter((p) => {
    if (p.stock < minStock) return false;
    if (activeCategory !== "all" && getCategoryForProduct(p) !== activeCategory)
      return false;
    if (search) {
      const searchText = (
        p.product_name +
        " " +
        (p.variant || "")
      ).toLowerCase();
      if (!searchText.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const groupedProducts = filteredProducts.reduce(
    (acc, product) => {
      if (!acc[product.product_name]) {
        acc[product.product_name] = [];
      }
      acc[product.product_name].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  const filteredProductKeys = filteredProducts.map(
    (p) => `${p.pid}||${p.variant || ""}`,
  );
  const allFilteredSelected =
    filteredProductKeys.length > 0 &&
    filteredProductKeys.every((key) => selectedItems.has(key));

  const selectFilteredProducts = () => {
    setSelectedItems((currentSelected) => {
      const newSelected = new Set(currentSelected);
      filteredProductKeys.forEach((key) => newSelected.add(key));
      return newSelected;
    });
  };

  const clearFilteredProducts = () => {
    setSelectedItems((currentSelected) => {
      const newSelected = new Set(currentSelected);
      filteredProductKeys.forEach((key) => newSelected.delete(key));
      return newSelected;
    });
  };

  const selectedProducts = Array.from(selectedItems)
    .map((key) => {
      const [pid, variant] = key.split("||");
      return products.find(
        (p) => String(p.pid) === pid && (p.variant || "") === variant,
      );
    })
    .filter(Boolean) as Product[];

  const selectedItemsForPanel = selectedProducts.map((p) => ({
    key: `${p.pid}||${p.variant || ""}`,
    group: p.product_name,
    variant: p.variant || p.product_name,
    stock: p.stock,
    image_url: p.image_url,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">...</div>
          <p className="text-[#6B7280]">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col pb-16 transition-[margin] duration-200 md:ml-[var(--sidebar-offset,210px)] md:pb-0">
        <Header title="สินค้าพร้อมส่ง" onSyncComplete={loadProducts} />

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-20 sm:px-[22px] sm:py-[18px]">
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-[18px]">
            <div className="flex-1 min-w-0">
              <div className="mb-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]/95 p-2.5 shadow-sm backdrop-blur">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#111827]">
                      ตัวกรองสินค้า
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      แสดง {filteredProducts.length} รายการ จากทั้งหมด{" "}
                      {products.length} รายการ
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setControlsCollapsed((current) => !current)
                      }
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#10B981] hover:text-[#059669]"
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${
                          controlsCollapsed ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="m6 9 6 6 6-6"
                        />
                      </svg>
                      {controlsCollapsed ? "แสดงตัวกรอง" : "ซ่อนตัวกรอง"}
                    </button>
                  </div>
                </div>

                {!controlsCollapsed && (
                  <>
                    <FilterBar
                      onSearch={setSearch}
                      onMinStockChange={setMinStock}
                    />

                    <CategoryPills
                      pills={[
                        { id: "all", label: "ทั้งหมด", icon: "\u{1F4E6}" },
                        ...categories,
                      ]}
                      active={activeCategory}
                      onSelect={setActiveCategory}
                    />

                    <Stats
                      inStock={products.filter((p) => p.stock > minStock).length}
                      selected={selectedItems.size}
                      groups={Object.keys(groupedProducts).length}
                    />
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) =>
                        e.target.checked
                          ? selectFilteredProducts()
                          : clearFilteredProducts()
                      }
                      disabled={filteredProductKeys.length === 0}
                      className="h-4 w-4"
                    />
                    เลือกทั้งหมดที่แสดง
                  </label>
                  <button
                    type="button"
                    onClick={selectFilteredProducts}
                    disabled={filteredProductKeys.length === 0}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280] transition-colors hover:border-[#10B981] hover:text-[#10B981] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={clearFilteredProducts}
                    disabled={filteredProductKeys.length === 0}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280] transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ยกเลิกทั้งหมด
                  </button>
                </div>
              </div>

              {Object.entries(groupedProducts)
                .sort((a, b) => a[0].localeCompare(b[0], "th"))
                .map(([group, items]) => (
                  <ProductGroup
                    key={group}
                    group={group}
                    items={items.map((p) => ({
                      pid: p.pid,
                      fullName: p.full_name,
                      variant: p.variant || "",
                      stock: p.stock,
                    }))}
                    selectedItems={selectedItems}
                    isCollapsed={collapsedGroups.has(group)}
                    onToggleCollapse={() => {
                      setCollapsedGroups((currentCollapsed) => {
                        const newCollapsed = new Set(currentCollapsed);
                        if (newCollapsed.has(group)) {
                          newCollapsed.delete(group);
                        } else {
                          newCollapsed.add(group);
                        }
                        return newCollapsed;
                      });
                    }}
                    onSelect={(key, checked) => {
                      setSelectedItems((currentSelected) => {
                        const newSelected = new Set(currentSelected);
                        if (checked) {
                          newSelected.add(key);
                        } else {
                          newSelected.delete(key);
                        }
                        return newSelected;
                      });
                    }}
                  />
                ))}
            </div>

            <RightPanel
              selectedItems={selectedItemsForPanel}
              showQty={showQty}
              onShowQtyChange={setShowQty}
              onViewList={() => setProductModalOpen(true)}
              onRemoveItem={(key) => {
                setSelectedItems((currentSelected) => {
                  const newSelected = new Set(currentSelected);
                  newSelected.delete(key);
                  return newSelected;
                });
              }}
              onClearItems={() => setSelectedItems(new Set())}
            />
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={productModalOpen}
        products={selectedProducts}
        onClose={() => setProductModalOpen(false)}
      />
    </div>
  );
}
