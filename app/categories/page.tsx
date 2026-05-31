"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { createCategoryId } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

interface CategoryRow {
  id: string;
  label: string;
  icon: string | null;
  sort_order: number;
  isNew?: boolean;
  isDirty?: boolean;
  isDeleted?: boolean;
}

interface KeywordRow {
  id: string;
  category_id: string;
  keyword: string;
  isNew?: boolean;
  isDirty?: boolean;
  isDeleted?: boolean;
}

type CategoryDialog =
  | { mode: "insert"; label: string; icon: string }
  | { mode: "edit"; id: string; label: string; icon: string };

type KeywordDialog =
  | { mode: "insert"; keyword: string; categoryId: string }
  | { mode: "edit"; id: string; keyword: string; categoryId: string };

const DEFAULT_ICON = "🏷️";
const PAGE_SIZE = 10;

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialog | null>(
    null,
  );
  const [keywordDialog, setKeywordDialog] = useState<KeywordDialog | null>(
    null,
  );
  const [categoryPage, setCategoryPage] = useState(1);
  const [keywordPage, setKeywordPage] = useState(1);
  const [keywordCategoryFilter, setKeywordCategoryFilter] = useState("all");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(
    new Set(),
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => !category.isDeleted),
    [categories],
  );

  const activeKeywords = useMemo(
    () => keywords.filter((keyword) => !keyword.isDeleted),
    [keywords],
  );

  const filteredKeywords = useMemo(() => {
    const normalizedSearch = keywordSearch.trim().toLowerCase();
    return activeKeywords.filter(
      (keyword) =>
        (keywordCategoryFilter === "all" ||
          keyword.category_id === keywordCategoryFilter) &&
        (!normalizedSearch ||
          keyword.keyword.toLowerCase().includes(normalizedSearch)),
    );
  }, [activeKeywords, keywordCategoryFilter, keywordSearch]);

  const keywordCountByCategory = useMemo(() => {
    return activeKeywords.reduce<Record<string, number>>((acc, keyword) => {
      acc[keyword.category_id] = (acc[keyword.category_id] || 0) + 1;
      return acc;
    }, {});
  }, [activeKeywords]);

  const categoryLabelById = useMemo(() => {
    return activeCategories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = `${category.icon || DEFAULT_ICON} ${category.label}`;
      return acc;
    }, {});
  }, [activeCategories]);

  const hasChanges = useMemo(() => {
    return (
      categories.some(
        (category) => category.isNew || category.isDirty || category.isDeleted,
      ) ||
      keywords.some(
        (keyword) => keyword.isNew || keyword.isDirty || keyword.isDeleted,
      )
    );
  }, [categories, keywords]);

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(activeCategories.length / PAGE_SIZE),
  );
  const keywordTotalPages = Math.max(
    1,
    Math.ceil(filteredKeywords.length / PAGE_SIZE),
  );
  const safeCategoryPage = Math.min(categoryPage, categoryTotalPages);
  const safeKeywordPage = Math.min(keywordPage, keywordTotalPages);
  const paginatedCategories = activeCategories.slice(
    (safeCategoryPage - 1) * PAGE_SIZE,
    safeCategoryPage * PAGE_SIZE,
  );
  const paginatedKeywords = filteredKeywords.slice(
    (safeKeywordPage - 1) * PAGE_SIZE,
    safeKeywordPage * PAGE_SIZE,
  );
  const paginatedKeywordIds = paginatedKeywords.map((keyword) => keyword.id);
  const selectedKeywordCount = selectedKeywordIds.size;
  const allPageKeywordsSelected =
    paginatedKeywordIds.length > 0 &&
    paginatedKeywordIds.every((id) => selectedKeywordIds.has(id));
  const pendingCategoryCount = categories.filter(
    (category) => category.isNew || category.isDirty || category.isDeleted,
  ).length;
  const pendingKeywordCount = keywords.filter(
    (keyword) => keyword.isNew || keyword.isDirty || keyword.isDeleted,
  ).length;

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const [categoryResult, keywordResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, label, icon, sort_order")
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true }),
      supabase
        .from("category_keywords")
        .select("id, category_id, keyword")
        .order("keyword", { ascending: true }),
    ]);

    if (categoryResult.error) throw categoryResult.error;
    if (keywordResult.error) throw keywordResult.error;

    setCategories(categoryResult.data || []);
    setKeywords(keywordResult.data || []);
    setSelectedKeywordIds(new Set());
  }, [router]);

  useEffect(() => {
    void Promise.resolve()
      .then(loadData)
      .catch((error) => {
        const text = error instanceof Error ? error.message : "Unknown error";
        setMessage(
          "โหลดข้อมูลหมวดหมู่ไม่สำเร็จ: " +
            text +
            " ถ้ายังไม่ได้สร้างตาราง ให้รันไฟล์ supabase-categories.sql ก่อน",
        );
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const openInsertCategory = () => {
    setCategoryDialog({ mode: "insert", label: "", icon: DEFAULT_ICON });
  };

  const openEditCategory = (category: CategoryRow) => {
    setCategoryDialog({
      mode: "edit",
      id: category.id,
      label: category.label,
      icon: category.icon || DEFAULT_ICON,
    });
  };

  const openInsertKeyword = () => {
    setKeywordDialog({
      mode: "insert",
      keyword: "",
      categoryId: activeCategories[0]?.id || "",
    });
  };

  const openEditKeyword = (keyword: KeywordRow) => {
    setKeywordDialog({
      mode: "edit",
      id: keyword.id,
      keyword: keyword.keyword,
      categoryId: keyword.category_id,
    });
  };

  const applyCategoryDialog = () => {
    if (!categoryDialog || !categoryDialog.label.trim()) return;

    if (categoryDialog.mode === "insert") {
      const label = categoryDialog.label.trim();
      const baseId = createCategoryId(label);
      const id = categories.some((category) => category.id === baseId)
        ? `${baseId}-${Date.now()}`
        : baseId;
      const nextSortOrder =
        activeCategories.reduce(
          (max, category) => Math.max(max, category.sort_order || 0),
          0,
        ) + 10;

      setCategories((current) => [
        ...current,
        {
          id,
          label,
          icon: categoryDialog.icon.trim() || DEFAULT_ICON,
          sort_order: nextSortOrder,
          isNew: true,
        },
      ]);
      setCategoryPage(Math.ceil((activeCategories.length + 1) / PAGE_SIZE));
    } else {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryDialog.id
            ? {
                ...category,
                label: categoryDialog.label.trim(),
                icon: categoryDialog.icon.trim() || DEFAULT_ICON,
                isDirty: category.isNew ? category.isDirty : true,
              }
            : category,
        ),
      );
    }

    setCategoryDialog(null);
    setMessage("มีรายการเปลี่ยนแปลง กดบันทึกเพื่ออัปเดตลง DB");
  };

  const applyKeywordDialog = () => {
    if (
      !keywordDialog ||
      !keywordDialog.keyword.trim() ||
      !keywordDialog.categoryId
    )
      return;

    if (keywordDialog.mode === "insert") {
      setKeywords((current) => [
        ...current,
        {
          id: `temp-keyword-${Date.now()}`,
          category_id: keywordDialog.categoryId,
          keyword: keywordDialog.keyword.trim(),
          isNew: true,
        },
      ]);
      setKeywordCategoryFilter(keywordDialog.categoryId);
      setKeywordPage(
        Math.ceil(
          (activeKeywords.filter(
            (keyword) => keyword.category_id === keywordDialog.categoryId,
          ).length +
            1) /
            PAGE_SIZE,
        ),
      );
    } else {
      setKeywords((current) =>
        current.map((keyword) =>
          keyword.id === keywordDialog.id
            ? {
                ...keyword,
                category_id: keywordDialog.categoryId,
                keyword: keywordDialog.keyword.trim(),
                isDirty: keyword.isNew ? keyword.isDirty : true,
              }
            : keyword,
        ),
      );
    }

    setKeywordDialog(null);
    setMessage("มีรายการเปลี่ยนแปลง กดบันทึกเพื่ออัปเดตลง DB");
  };

  const markCategoryDeleted = (category: CategoryRow) => {
    if ((keywordCountByCategory[category.id] || 0) > 0) return;

    setCategories((current) =>
      category.isNew
        ? current.filter((item) => item.id !== category.id)
        : current.map((item) =>
            item.id === category.id ? { ...item, isDeleted: true } : item,
          ),
    );
    setMessage("มีรายการเปลี่ยนแปลง กดบันทึกเพื่ออัปเดตลง DB");
  };

  const markKeywordDeleted = (keyword: KeywordRow) => {
    setKeywords((current) =>
      keyword.isNew
        ? current.filter((item) => item.id !== keyword.id)
        : current.map((item) =>
            item.id === keyword.id ? { ...item, isDeleted: true } : item,
          ),
    );
    setSelectedKeywordIds((current) => {
      const next = new Set(current);
      next.delete(keyword.id);
      return next;
    });
    setMessage("มีรายการเปลี่ยนแปลง กดบันทึกเพื่ออัปเดตลง DB");
  };

  const toggleKeywordSelection = (id: string, checked: boolean) => {
    setSelectedKeywordIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const togglePageKeywordSelection = (checked: boolean) => {
    setSelectedKeywordIds((current) => {
      const next = new Set(current);
      paginatedKeywordIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const markSelectedKeywordsDeleted = () => {
    if (selectedKeywordIds.size === 0) return;

    setKeywords((current) =>
      current
        .filter(
          (keyword) => !keyword.isNew || !selectedKeywordIds.has(keyword.id),
        )
        .map((keyword) =>
          selectedKeywordIds.has(keyword.id)
            ? { ...keyword, isDeleted: true }
            : keyword,
        ),
    );
    setSelectedKeywordIds(new Set());
    setMessage("มีรายการเปลี่ยนแปลง กดบันทึกเพื่ออัปเดตลง DB");
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage("");

    try {
      const deletedKeywords = keywords.filter(
        (keyword) => keyword.isDeleted && !keyword.isNew,
      );
      const deletedCategories = categories.filter(
        (category) => category.isDeleted && !category.isNew,
      );
      const upsertCategories = categories.filter(
        (category) =>
          !category.isDeleted && (category.isNew || category.isDirty),
      );
      const newKeywords = keywords.filter(
        (keyword) => !keyword.isDeleted && keyword.isNew,
      );
      const updatedKeywords = keywords.filter(
        (keyword) => !keyword.isDeleted && !keyword.isNew && keyword.isDirty,
      );

      for (const keyword of deletedKeywords) {
        const { error } = await supabase
          .from("category_keywords")
          .delete()
          .eq("id", keyword.id);
        if (error) throw error;
      }

      if (upsertCategories.length > 0) {
        const { error } = await supabase.from("categories").upsert(
          upsertCategories.map((category) => ({
            id: category.id,
            label: category.label,
            icon: category.icon || DEFAULT_ICON,
            sort_order: category.sort_order,
            updated_at: new Date().toISOString(),
          })),
        );
        if (error) throw error;
      }

      if (newKeywords.length > 0) {
        const { error } = await supabase.from("category_keywords").insert(
          newKeywords.map((keyword) => ({
            category_id: keyword.category_id,
            keyword: keyword.keyword,
          })),
        );
        if (error) throw error;
      }

      for (const keyword of updatedKeywords) {
        const { error } = await supabase
          .from("category_keywords")
          .update({
            category_id: keyword.category_id,
            keyword: keyword.keyword,
          })
          .eq("id", keyword.id);
        if (error) throw error;
      }

      for (const category of deletedCategories) {
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", category.id);
        if (error) throw error;
      }

      await loadData();
      setMessage("บันทึกลง DB แล้ว");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setMessage("บันทึกไม่สำเร็จ: " + text);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-sm text-[#6B7280]">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col pb-16 transition-[margin] duration-200 md:ml-[var(--sidebar-offset,210px)] md:pb-0">
        <Header title="หมวดหมู่และ Keywords" />

        <main className="flex-1 overflow-auto px-3 py-3 sm:px-[22px] sm:py-[18px]">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard
                label="หมวดหมู่"
                value={activeCategories.length}
                helper="จำนวนหมวดที่ใช้งานอยู่"
              />
              <SummaryCard
                label="Keywords"
                value={activeKeywords.length}
                helper="คำค้นทั้งหมด"
              />
              <SummaryCard
                label="รอบันทึก"
                value={pendingCategoryCount + pendingKeywordCount}
                helper={`${pendingCategoryCount} หมวด / ${pendingKeywordCount} keyword`}
                tone={hasChanges ? "warning" : "default"}
              />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      hasChanges
                        ? "bg-[#FEF3C7] text-[#92400E]"
                        : "bg-[#D1FAE5] text-[#047857]"
                    }`}
                  >
                    {hasChanges ? "มีรายการรอบันทึก" : "ข้อมูลล่าสุดแล้ว"}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-[#111827]">
                  จัดการหมวดหมู่และ keyword
                </div>
                <div className="mt-0.5 text-xs text-[#6B7280]">
                  เพิ่ม แก้ไข หรือลบข้อมูลในหน้านี้ก่อน แล้วกดบันทึกเพื่ออัปเดตลง DB
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadData()}
                  disabled={saving}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] hover:border-[#10B981] hover:text-[#059669] disabled:opacity-50"
                >
                  รีโหลด
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={saving || !hasChanges}
                  className="rounded-lg bg-[#10B981] px-5 py-2 text-xs font-semibold text-white hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-lg border p-3 text-sm shadow-sm ${
                  message.includes("ไม่สำเร็จ")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                }`}
              >
                {message}
              </div>
            )}

            <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#111827]">
                    ตารางหมวดหมู่
                  </div>
                  <div className="mt-0.5 text-xs text-[#6B7280]">
                    {activeCategories.length} หมวดหมู่
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openInsertCategory}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]"
                >
                  เพิ่มข้อมูล
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[#F1F5F9] text-xs uppercase text-[#475569]">
                    <tr>
                      <th className="w-16 px-4 py-2 text-right font-semibold">
                        #
                      </th>
                      <th className="px-4 py-2 font-semibold">Icon</th>
                      <th className="px-4 py-2 font-semibold">Category</th>
                      <th className="px-4 py-2 font-semibold">ID</th>
                      <th className="px-4 py-2 text-right font-semibold">
                        Keywords
                      </th>
                      <th className="px-4 py-2 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {paginatedCategories.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10">
                          <EmptyTableState
                            title="ยังไม่มีหมวดหมู่"
                            description="เพิ่มหมวดหมู่แรกเพื่อเริ่มจัดกลุ่ม keywords"
                          />
                        </td>
                      </tr>
                    )}
                    {paginatedCategories.map((category, index) => {
                      const keywordCount =
                        keywordCountByCategory[category.id] || 0;
                      const deleteDisabled = keywordCount > 0;

                      return (
                        <tr
                          key={category.id}
                          className={`transition-colors hover:bg-[#F8FAFC] ${
                            category.isNew || category.isDirty
                              ? "bg-[#ECFDF5]"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-right text-xs font-semibold text-[#9CA3AF]">
                            {(safeCategoryPage - 1) * PAGE_SIZE + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-lg">
                              {category.icon || DEFAULT_ICON}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[#111827]">
                              {category.label}
                            </div>
                            {(category.isNew || category.isDirty) && (
                              <div className="mt-1 text-xs font-medium text-[#059669]">
                                รอบันทึก
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#64748B]">
                            {category.id}
                          </td>
                          <td className="px-4 py-3 text-right text-[#6B7280]">
                            <span className="inline-flex min-w-8 justify-center rounded-full bg-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#475569]">
                              {keywordCount}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditCategory(category)}
                                aria-label={`แก้ไข ${category.label}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6] text-white transition-colors hover:bg-[#2563EB]"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => markCategoryDeleted(category)}
                                disabled={deleteDisabled}
                                aria-label={`ลบ ${category.label}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={safeCategoryPage}
                pageSize={PAGE_SIZE}
                totalItems={activeCategories.length}
                totalPages={categoryTotalPages}
                onPageChange={setCategoryPage}
              />
            </section>

            <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#111827]">
                      ตาราง Keywords
                    </div>
                    <div className="mt-0.5 text-xs text-[#6B7280]">
                      {filteredKeywords.length} จาก {activeKeywords.length} keywords
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={markSelectedKeywordsDeleted}
                      disabled={selectedKeywordCount === 0}
                      className="h-9 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ลบทั้งหมด ({selectedKeywordCount})
                    </button>
                    <button
                      type="button"
                      onClick={openInsertKeyword}
                      disabled={activeCategories.length === 0}
                      className="h-9 rounded-lg bg-[#3B82F6] px-4 text-xs font-semibold text-white hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      เพิ่มข้อมูล
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_16rem]">
                  <div className="relative">
                    <input
                      value={keywordSearch}
                      onChange={(event) => {
                        setKeywordSearch(event.target.value);
                        setKeywordPage(1);
                      }}
                      placeholder="ค้นหา keyword"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#10B981]"
                    />
                  </div>
                  <select
                    value={keywordCategoryFilter}
                    onChange={(event) => {
                      setKeywordCategoryFilter(event.target.value);
                      setKeywordPage(1);
                    }}
                    className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#10B981]"
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon || DEFAULT_ICON} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[#F1F5F9] text-xs uppercase text-[#475569]">
                    <tr>
                      <th className="w-12 px-4 py-2 text-center font-semibold">
                        <input
                          type="checkbox"
                          checked={allPageKeywordsSelected}
                          onChange={(event) =>
                            togglePageKeywordSelection(event.target.checked)
                          }
                          className="h-4 w-4"
                          aria-label="เลือก keywords ในหน้านี้"
                        />
                      </th>
                      <th className="w-16 px-4 py-2 text-right font-semibold">
                        #
                      </th>
                      <th className="px-4 py-2 font-semibold">Keyword</th>
                      <th className="px-4 py-2 font-semibold">Category</th>
                      <th className="px-4 py-2 font-semibold">ID</th>
                      <th className="px-4 py-2 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {paginatedKeywords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10">
                          <EmptyTableState
                            title="ไม่พบ keyword"
                            description="ลองเปลี่ยนตัวกรอง หรือเพิ่ม keyword ใหม่"
                          />
                        </td>
                      </tr>
                    )}
                    {paginatedKeywords.map((keyword, index) => (
                      <tr
                        key={keyword.id}
                        className={`transition-colors hover:bg-[#F8FAFC] ${
                          keyword.isNew || keyword.isDirty ? "bg-[#EFF6FF]" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedKeywordIds.has(keyword.id)}
                            onChange={(event) =>
                              toggleKeywordSelection(
                                keyword.id,
                                event.target.checked,
                              )
                            }
                            className="h-4 w-4"
                            aria-label={`เลือก ${keyword.keyword}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-[#9CA3AF]">
                          {(safeKeywordPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#111827]">
                            {keyword.keyword}
                          </div>
                          {(keyword.isNew || keyword.isDirty) && (
                            <div className="mt-1 text-xs font-medium text-[#2563EB]">
                              รอบันทึก
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex max-w-xs items-center rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#475569]">
                            {categoryLabelById[keyword.category_id] ||
                              keyword.category_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">
                          {keyword.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditKeyword(keyword)}
                              aria-label={`แก้ไข ${keyword.keyword}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6] text-white transition-colors hover:bg-[#2563EB]"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => markKeywordDeleted(keyword)}
                              aria-label={`ลบ ${keyword.keyword}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={safeKeywordPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredKeywords.length}
                totalPages={keywordTotalPages}
                onPageChange={setKeywordPage}
              />
            </section>
          </div>
        </main>
      </div>

      {categoryDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-[#E5E7EB] px-4 py-3">
              <div className="text-sm font-semibold text-[#111827]">
                {categoryDialog.mode === "insert"
                  ? "เพิ่มหมวดหมู่"
                  : "แก้ไข หมวดหมู่"}
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  ไอค่อน
                </label>
                <input
                  value={categoryDialog.icon}
                  onChange={(event) =>
                    setCategoryDialog({
                      ...categoryDialog,
                      icon: event.target.value,
                    })
                  }
                  placeholder="เช่น 🏷️"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  ชื่อหมวดหมู่
                </label>
                <input
                  value={categoryDialog.label}
                  onChange={(event) =>
                    setCategoryDialog({
                      ...categoryDialog,
                      label: event.target.value,
                    })
                  }
                  placeholder="ชื่อหมวดหมู่"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
              <button
                type="button"
                onClick={() => setCategoryDialog(null)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#6B7280]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={applyCategoryDialog}
                disabled={!categoryDialog.label.trim()}
                className="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {keywordDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-[#E5E7EB] px-4 py-3">
              <div className="text-sm font-semibold text-[#111827]">
                {keywordDialog.mode === "insert"
                  ? "เพิ่ม keyword"
                  : "แก้ไข keyword"}
              </div>
            </div>
            <div className="space-y-3 p-4">
              <select
                value={keywordDialog.categoryId}
                onChange={(event) =>
                  setKeywordDialog({
                    ...keywordDialog,
                    categoryId: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#10B981]"
              >
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon || DEFAULT_ICON} {category.label}
                  </option>
                ))}
              </select>
              <input
                value={keywordDialog.keyword}
                onChange={(event) =>
                  setKeywordDialog({
                    ...keywordDialog,
                    keyword: event.target.value,
                  })
                }
                placeholder="Keyword"
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#10B981]"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
              <button
                type="button"
                onClick={() => setKeywordDialog(null)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#6B7280]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={applyKeywordDialog}
                disabled={
                  !keywordDialog.keyword.trim() || !keywordDialog.categoryId
                }
                className="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  helper: string;
  tone?: "default" | "warning";
}

function SummaryCard({
  label,
  value,
  helper,
  tone = "default",
}: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase text-[#6B7280]">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-[#111827]">
            {value}
          </div>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${
            tone === "warning"
              ? "bg-[#FEF3C7] text-[#92400E]"
              : "bg-[#ECFDF5] text-[#047857]"
          }`}
        >
          {tone === "warning" ? "!" : "#"}
        </span>
      </div>
      <div className="mt-2 text-xs text-[#6B7280]">{helper}</div>
    </div>
  );
}

interface EmptyTableStateProps {
  title: string;
  description: string;
}

function EmptyTableState({ title, description }: EmptyTableStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center">
      <div className="text-sm font-semibold text-[#111827]">{title}</div>
      <div className="mt-1 text-xs text-[#6B7280]">{description}</div>
    </div>
  );
}

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-[#6B7280]">
        แสดง {startItem}-{endItem} จาก {totalItems} รายการ
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="ก่อนหน้า"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981] hover:text-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeftIcon />
        </button>
        <span className="min-w-16 text-center text-xs font-semibold text-[#374151]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="ถัดไป"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981] hover:text-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
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
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
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
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
